import { AudioPlayer, AudioResource, createAudioResource } from "@discordjs/voice";
import { Snowflake } from "discord.js";
import { InfoData, stream_from_info, video_info, YouTubeStream } from "play-dl";
import { ResourceUnobtainableError } from "../errors/ResourceUnobtainableError";
import { TimeoutError } from "../errors/TimeoutError";
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

    /**Creates a new YouTube Video request.
     * @param {string} input A YouTube video link or raw video ID.
     * @param {Snowflake} userId The ID of the user who made this request.
     * @param {Snowflake} channelId The ID of the channel in which to play this request.
     * @throws {@link UnresolvedUserError} See linked documentation for exact circumstances.
     * @throws {@link UnresolvedChannelError} See linked documentation for exact circumstances.
     * @throws {@link NonVoiceChannelError} See linked documentation for exact circumstances.
     * @see {@link Request} constructor for sources of error.
     */
    constructor( input: string, userId: Snowflake, channelId: Snowflake ) {
        super( input, userId, channelId );

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
        }, globalThis.promiseTimeout );

        try { this.info = await video_info( this.cleanInput ); }
        catch ( error ) {
            fulfilled = true;
            throw new ResourceUnobtainableError( `Unable to obtain video info: ${error}` );
        }//end try-catch

        this._resourceUrl = this.info.video_details.url;
        this._title = this.info.video_details.title ?? "Unknown";
        this._creator = this.info.video_details.channel?.name ?? "Unknown";
        this._thumbnailUrl = this.info.video_details.thumbnails[0]?.url;

        if ( this.info.video_details.live ) {
            this._length = Infinity;
            this._lengthFormatted = "🔴 LIVE";
        } else {
            this._length = this.info.video_details.durationInSec;
            this._lengthFormatted = this.info.video_details.durationRaw;
        }//end if-else

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
        }, globalThis.promiseTimeout );

        try {

            this.stream = await stream_from_info(
                this.info!,
                {
                    discordPlayerCompatibility: true
                }
            );

        } catch ( error ) {
            fulfilled = true;
            throw new ResourceUnobtainableError( `Unable to obtain stream: ${error}` );
        }//end try-catch

        this.resource = createAudioResource(
            this.stream.stream,
            { inputType: this.stream.type },
        );

        player.play( this.resource );
        this.player = player;

        fulfilled = true;

        this._started = true;
        this._paused = false;

        return;
    }//end method play

    /**
     * @throws {@link UninitializedRequestError} If called before {@link init()} has finished.
     * @throws If not yet playing or unable to pause the request.
     */
    public async pause(): Promise<void> {
        if ( !this.ready )
            throw new UninitializedRequestError( `Request with input "${this.input}" paused before ready` );

        if ( !this.started || !this.player!.pause() )
            throw new Error( "Unable to pause request" );

        this._paused = true;

        return;
    }//end method pause

    /**
     * @throws {@link UninitializedRequestError} If called before {@link init()} has finished.
     * @throws If not paused or unable to resume the request.
     */
    public async resume(): Promise<void> {
        if ( !this.ready )
            throw new UninitializedRequestError( `Request with input "${this.input}" paused before ready` );

        if ( !this.paused || !this.player!.unpause() )
            throw new Error( "Unable to resume request" );

        if ( !this.info!.video_details.live )
            this.play( this.player! );

        this._paused = false;

        return;
    }//end method resume

}//end class YouTubeVideoRequest