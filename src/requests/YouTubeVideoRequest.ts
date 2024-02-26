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
    protected cleanInput: string;

    /**The play-dl info retreived for this request. Undefined until request is ready. 
     * @see https://play-dl.github.io/interfaces/InfoData.html
    */
    protected info: InfoData | undefined;

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
        return this.info?.video_details.url;
    }//end getter resourceUrl

    public get title(): string | undefined {
        return this.info?.video_details.title;
    }//end getter title

    public get creator(): string | undefined {
        return this.info?.video_details.channel?.name;
    }//end getter creator

    /**The total length of this YouTube video request in seconds, or `Infinity` if this request is a YouTube live stream. Null if video is upcoming/premiere.
     * Undefined until request is ready.
     */
    public get length(): number | null | undefined {
        if ( this.info?.video_details.live === undefined ) return undefined;

        if ( this.info?.video_details.live ) return Infinity;

        if ( this.info?.video_details.upcoming ) return null;

        return this.info.video_details.durationInSec;
    }//end getter length

    /**String for the total duration of this YouTube video request, formatted as HH:MM:SS. Null for livestreams and upcoming/premieres. Undefined until request is ready. */
    public get lengthFormatted(): string | null | undefined {
        if ( this.info?.video_details.live === undefined ) return undefined;

        //Same bodge as .live
        if ( ( !this.info.video_details.durationInSec && !this.info.video_details.upcoming ) || this.info?.video_details.upcoming ) return null;

        return this.info.video_details.durationRaw;
    }//end getter lengthFormatted

    public get thumbnailUrl(): string | undefined {
        try { return this.info?.video_details.thumbnails[0].url; }
        catch { return undefined; }
    }//end getter thumbnailUrl

    public get upcoming(): Date | boolean | undefined {
        if ( !this.info ) return undefined;

        if ( !this.info.video_details.upcoming ) return false;

        return this.info.video_details.upcoming;
    }//end getter upcoming

    public get live(): boolean | undefined {
        if ( !this.info ) return undefined;

        //Dirty bodge, but blame YT/Play-DL
        return !this.info.video_details.durationInSec && !this.info.video_details.upcoming;
    }//end getter live

    /**
     * @throws {@link ResourceUnobtainableError} When an error occurs while retreiving request info.
     */
    public async init(): Promise<void> {
        if ( this.ready )
            return;

        try { this.info = await video_info( this.cleanInput ); }
        catch ( error ) {
            throw new ResourceUnobtainableError( `${error}` );
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
            throw new UninitializedRequestError( `Request for "${this.input}" played before ready` );

        try {
            stream = await stream_from_info(
                this.info!,
                { discordPlayerCompatibility: true }
            );
        } catch ( error ) {
            throw new ResourceUnobtainableError( `${error}` );
        }//end try-catch

        resource = createAudioResource(
            stream.stream,
            { inputType: stream.type },
        );

        player.play( resource );
        this.player = player;

        this._started = true;
        this._playing = true;
        this._paused = false;

        return;
    }//end method play

    /**
     * @throws {@link UninitializedRequestError} If called before {@link init()} has finished.
     * @throws If not yet playing or unable to pause the request.
     */
    public async pause(): Promise<void> {
        if ( !this.ready )
            throw new UninitializedRequestError( `Request for "${this.input}" paused before ready` );

        if ( !this.started )
            throw new Error( "Unable to pause request: request not started. " );
        else if ( !this.player!.pause() ) {
            //As last resort, wait 100 ms and try again. Otherwise, if immediately began playing and puase happens, pause may fail
            await new Promise( () => setTimeout( () => {}, 100 ) );

            if ( !this.player!.pause() )
                throw new Error( "Unable to pause request: discord.js player refused to pause. " );
        }//end if-else

        this._paused = true;
        this._playing = false;

        return;
    }//end method pause

    /**
     * @throws {@link UninitializedRequestError} If called before {@link init()} has finished.
     * @throws If not paused or unable to resume the request.
     */
    public async resume(): Promise<void> {
        if ( !this.ready )
            throw new UninitializedRequestError( `Request for "${this.input}" resumed before ready` );

        if ( !this.paused )
            throw new Error( "Unable to resume request: request is not paused" );

        if ( this.info!.video_details.live )
            this.play( this.player! );
        else if ( !this.player!.unpause() )
            throw new Error( "discord.js player refused to unpause" );

        this._paused = false;
        this._playing = true;

        return;
    }//end method resume

}//end class YouTubeVideoRequest