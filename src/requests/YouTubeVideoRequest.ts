import { AudioPlayer, AudioResource, createAudioResource } from "@discordjs/voice";
import { Snowflake } from "discord.js";
import { InfoData, stream_from_info, video_info, YouTubeStream } from "play-dl";
import { ResourceUnobtainableError } from "../errors/ResourceUnobtainableError";
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
    private info: InfoData | undefined;

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

        this.info = undefined;
        this._started = false;
        this._playing = false;
    }//end constructor

    public get ready(): boolean {
        return !!this.info;
    }//end getter ready

    public get resourceUrl(): string | undefined {
        return this.cleanInput;
    }//end getter resourceUrl

    public get title(): string | undefined {
        return this.info?.video_details.title;
    }//end getter title

    public get creator(): string | undefined {
        return this.info?.video_details.channel?.name;
    }//end getter creator

    /**The total length of this YouTube video request in seconds, or `Infinity` if this request is a YouTube live stream.
     * Undefined until request is ready.
     */
    public get length(): number | undefined {
        if ( this.info?.video_details.live === undefined ) return undefined;

        return this.info?.video_details.live ? Infinity : this.info.video_details.durationInSec;
    }//end getter length

    /**String for the total duration of this YouTube video request, formatted as HH:MM:SS. Undefined until request is ready. */
    public get lengthFormatted(): string | undefined {
        if ( this.info?.video_details.live === undefined ) return undefined;

        return this.info?.video_details.live ? "🔴 LIVE" : this.info.video_details.durationRaw;
    }//end getter lengthFormatted

    public get thumbnailUrl(): string | undefined {
        try { return this.info?.video_details.thumbnails[0].url; }
        catch { return undefined; }
    }//end getter thumbnailUrl

    /**
     * @throws {@link ResourceUnobtainableError} When an error occurs while retreiving request info.
     */
    public async init(): Promise<void> {
        if ( this.ready )
            return;

        try { this.info = await video_info( this.cleanInput ); }
        catch ( error ) {
            throw new ResourceUnobtainableError( `Unable to obtain video info: ${error}` );
        }//end try-catch

        return;
    }//end method init

    /**
     * @throws {@link ResourceUnobtainableError} When an error occurs while retreiving the stream.
     * @throws {@link UninitializedRequestError} If called before {@link init()} has finished.
     */
    public async play( player: AudioPlayer ): Promise<void> {
        let resource: AudioResource;
        let stream: YouTubeStream;

        if ( !this.ready )
            throw new UninitializedRequestError( `Request with input "${this.input}" played before ready` );

        try {
            stream = await stream_from_info(
                this.info!,
                { discordPlayerCompatibility: true }
            );
        } catch ( error ) {
            throw new ResourceUnobtainableError( `Unable to obtain stream: ${error}` );
        }//end try-catch

        resource = createAudioResource(
            stream.stream,
            { inputType: stream.type },
        );

        player.play( resource );
        this.player = player;

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

        if ( !this.started )
            throw new Error( "Unable to pause request: request not started. " );
        else if ( !this.player!.pause() )
            throw new Error( "Unable to pause request: discord.js player refused to pause. " );

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

        if ( !this.paused )
            throw new Error( "Unable to resume request: request is not paused" );

        if ( this.info!.video_details.live )
            this.play( this.player! );
        else if ( !this.player!.unpause() )
            throw new Error( "Unable to resume request: discord.js player refused to unpause" );

        this._paused = false;

        return;
    }//end method resume

}//end class YouTubeVideoRequest