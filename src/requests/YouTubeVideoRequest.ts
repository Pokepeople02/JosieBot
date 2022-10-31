import { AudioPlayer, createAudioResource } from "@discordjs/voice";
import { Snowflake } from "discord.js";
import { InfoData, stream_from_info, video_info, YouTubeStream } from "play-dl";
import { ResourceUnobtainableError } from "../errors/ResourceUnobtainableError";
import { TimeoutError } from "../errors/TimeoutError";
import { DurationError } from "../errors/DurationError";
import { NonVoiceChannelError } from "../errors/NonVoiceChannelError";
import { UnresolvedChannelError } from "../errors/UnresolvedChannelError";
import { UnresolvedUserError } from "../errors/UnresolvedUserError";
import { Request } from "./Request";
import { UninitializedRequestError } from "../errors/UninitializedRequestError";

/**A request for a YouTube video resource made using a direct URL or video ID as input.
 * @remark Concrete requests should NOT be initialized using `new` if at all possible. See remark in linked parent.
 * @see {@link Request}
*/
export class YouTubeVideoRequest extends Request {

    /**The input YouTube video URL or ID after removal of post-ID clutter. */
    private cleanInput: string;
    /**The play-dl info retreived for this request. Undefined until request is ready. 
     * @see https://play-dl.github.io/interfaces/InfoData.html
    */
    private info: InfoData | undefined = undefined;
    /**The play-dl stream retreived for this request. Undefined until play has started.
     * @see https://play-dl.github.io/modules.html#YouTubeStream
     */
    private stream: YouTubeStream | undefined = undefined;
    /**Timer that stops play upon reaching the appropriate number of seconds dictated by {@link start} and {@link end}.
     * Undefined until play has started, cleared upon firing.
    */
    private playTimer: NodeJS.Timeout | undefined = undefined;

    /**Creates a new YouTube Video request.
     * @param {string} input A YouTube video link or raw video ID.
     * @param {Snowflake} userId The ID of the user who made this request.
     * @param {Snowflake} channelId The ID of the channel in which to play this request.
     * @param {Snowflake} start The number of seconds into the video to begin playback. Defaults to 0.
     * @param {Snowflake} end The number of seconds into the video to end playback. Defaults to the length of the video.
     * @throws {@link UnresolvedUserError} See linked documentation for exact circumstances.
     * @throws {@link DurationError} See linked documentation for exact circumstances.
     * @throws {@link UnresolvedChannelError} See linked documentation for exact circumstances.
     * @throws {@link NonVoiceChannelError} See linked documentation for exact circumstances.
     * @see {@link Request} constructor for sources of error.
     */
    constructor( input: string, userId: Snowflake, channelId: Snowflake, start?: number, end?: number ) {
        super( input, userId, channelId, start ?? 0, end ?? Infinity );

        if ( input.toLowerCase().includes( "youtube.com" ) && input.includes( "&" ) )
            this.cleanInput = input.substring( 0, input.indexOf( "&" ) );
        else
            this.cleanInput = input;

    }//end constructor

    /**
     * @throws {@link TimeoutError} When retreiving request info from YouTube takes too long to fulfill.
     * @throws {@link ResourceUnobtainableError} When an error occurs while retreiving request info.
     */
    public async init(): Promise<void> {
        let fulfilled = false;

        if ( this.ready )
            return;

        setTimeout( () => {
            if ( !fulfilled )
                throw new TimeoutError( "Request initialization timed out" );
        }, globalThis.timeLimit );

        try { this.info = await video_info( this.cleanInput ); }
        catch ( error ) {
            fulfilled = true;
            throw new ResourceUnobtainableError( `Unable to obtain video info: ${error}` );
        }//end try-catch

        this._resourceUrl = this.info.video_details.url;
        this._title = this.info.video_details.title ?? "Unknown";
        this._creator = this.info.video_details.channel?.name ?? "Unknown";
        this._length = this.info.video_details.durationInSec;
        this.end = this.info.video_details.durationInSec;
        this._thumbnailUrl = this.info.video_details.thumbnails[0]?.url;
        this._ready = true;

        fulfilled = true;
        return;
    }//end method init

    /**
     * @throws {@link TimeoutError} When retreiving the usable stream from YouTube takes too long to fulfill.
     * @throws {@link ResourceUnobtainableError} When an error occurs while retreiving the stream.
     * @throws {@link UninitializedRequestError} If called before {@link init()} has finished.
     */
    public async play( player: AudioPlayer ): Promise<void> {
        let fulfilled = false;

        if ( !this.ready )
            throw new UninitializedRequestError( `Request with input "${this.input}" played before ready` );

        setTimeout( () => {
            if ( !fulfilled )
                throw new TimeoutError( "Audio Resource creation timed out" );
        }, globalThis.timeLimit );

        try {

            this.stream = await stream_from_info(
                this.info!,
                {
                    discordPlayerCompatibility: true,
                    seek: this.start
                }
            );

        } catch ( error ) {
            fulfilled = true;
            throw new ResourceUnobtainableError( `Unable to obtain stream: ${error}` );
        }//end try-catch

        this.resource = createAudioResource(
            this.stream.stream,
            {
                inputType: this.stream.type
            }
        );

        player.play( this.resource );
        this.player = player;

        this.playTimer = setTimeout( () => {
            if ( !this.resource!.ended )
                this.player?.stop( true );

            this.playTimer = undefined;
        }, ( this.end - this.start ) * 1000 );

        fulfilled = true;
        this._started = true;
        return;
    }//end method play

    public async pause(): Promise<void> {
        throw new Error( "Method not implemented" );
    }//end method pause

    public async resume(): Promise<void> {
        throw new Error( "Method not implemented" );
    }//end method resume

}//end class YouTubeVideoRequest