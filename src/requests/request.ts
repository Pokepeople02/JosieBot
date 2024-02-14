import { AudioPlayer, AudioResource } from "@discordjs/voice";
import { Snowflake } from "discord.js";
import { NonVoiceChannelError } from "../errors/NonVoiceChannelError";
import { UnresolvedChannelError } from "../errors/UnresolvedChannelError";
import { UnresolvedUserError } from "../errors/UnresolvedUserError";

/**Base for children classes representing concrete request types.
 * @remark
 * After initialization of concrete child classes, asynchronously obtained fields are filled via {@link init()} before
 * the request is considered ready. It is recommended that the instantiation and initialization of concrete children request
 * types should be done exclusively through the factory method {@link create()} for ease of use.
*/
export abstract class Request {

    /**The ID of the voice channel in which to play this request. */
    private _channelId!: Snowflake;

    /**The ID of the user who made this request. */
    private _userId!: Snowflake;

    /**Whether this request has previously begun playback. */
    protected _started: boolean;

    /**Whether this request is currently playing. */
    protected _playing: boolean;

    /**Whether this request is currently paused. */
    protected _paused: boolean;

    /**The audio player currently playing this request. Undefined when not playing.
     * @see https://discord.js.org/#/docs/voice/main/class/AudioPlayer
    */
    protected player: AudioPlayer | undefined;

    /**The input to build this request from. */
    public readonly input: string;

    /**Creates a new request.
     * @param {string} input The input to build this request from.
     * @param {Snowflake} userId The ID of the user who made this request.
     * @param {Snowflake} channelId The ID of the channel in which to play this request.
     * @throws {@link UnresolvedUserError} When the supplied user ID does not resolve to a known user.
     * @throws {@link UnresolvedChannelError} When the supplied channel ID does not resolve to a known channel.
     * @throws {@link NonVoiceChannelError} When the supplied channel ID does not resolve to a voice-based channel.
     */
    constructor( input: string, userId: Snowflake, channelId: Snowflake ) {
        this.channelId = channelId;
        this.userId = userId;
        this.input = input;
        this._started = false;
        this._playing = false;
        this._paused = false;
        this.player = undefined;
    }//end constructor

    /**The ID of the voice channel in which to play this request. */
    public get channelId(): Snowflake {
        return this._channelId;
    }//end getter channelId

    /**
     * @throws {@link UnresolvedChannelError} When set to an ID that does not resolve to a known channel.
     * @throws {@link NonVoiceChannelError} When set to an ID that does not correspond to a voice-based channel.
     */
    public set channelId( newId: Snowflake ) {
        let resultChannel = globalThis.client.channels.resolve( newId );

        if ( !resultChannel )
            throw new UnresolvedChannelError( `Request playback channel ID "${newId})" does not resolve` );
        else if ( !resultChannel.isVoiceBased() )
            throw new NonVoiceChannelError( `Request's target channel "${resultChannel}" is not voice-based` );

        this._channelId = newId;
    }//end setter channelId

    /**The ID of the user who made this request. */
    public get userId(): Snowflake {
        return this._userId;
    }//end getter userId

    /**
     * @throws {@link UnresolvedUserError} When the requester's user ID does not resolve to a known user.
     */
    public set userId( newId: Snowflake ) {

        if ( !globalThis.client.users.resolve( newId ) )
            throw new UnresolvedUserError( `Unable to resolve request owner user ID (ID: ${newId})`, );

        this._userId = newId;
    }//end setter userId

    /**Whether this request has previously begun playback. */
    public get started(): boolean {
        return this._started;
    }//end getter started

    /**Whether this request is currently playing. */
    public get playing(): boolean {
        return this._playing;
    }//end getter playing

    /**Whether this request is currently paused. */
    public get paused(): boolean {
        return this._paused;
    }//end getter paused

    /**Whether this request is currently considered usable. */
    public abstract get ready(): boolean;

    /**The URL of this request's underlying resource. Undefined until request is ready.*/
    public abstract get resourceUrl(): string | undefined;

    /**The title of this request. Undefined until request is ready. */
    public abstract get title(): string | undefined;

    /**The attributed creator of this request's underlying resource. Undefined until request is ready. */
    public abstract get creator(): string | undefined;

    /**The total length of this request's underlying resource. Undefined until request is ready. `Infinity` if request is live. */
    public abstract get length(): number | undefined;

    /**Formatted string for the total length of this request's underlying resource. Undefined until request is ready. */
    public abstract get lengthFormatted(): string | undefined;

    /**The URL of the thumbnail of this request's underlying resource. Undefined until request is ready. */
    public abstract get thumbnailUrl(): string | undefined;

    /**Initializes asynchronously-filled properties and marks this request as ready to be used. */
    public abstract init(): Promise<void>;

    /**Plays the associated resource with this request on the supplied audio player.
     * @param {AudioPlayer} player The Audio Player through which the request should be played.
     * @see https://discord.js.org/#/docs/voice/main/class/AudioPlayer
     */
    public abstract play( player: AudioPlayer ): Promise<void>;

    /**Pauses this request for the previously supplied Audio Player, if it is currently playing. */
    public abstract pause(): Promise<void>;

    /**Resumes playing this request for the previously supplied Audio Player, if it is currently paused. */
    public abstract resume(): Promise<void>;

}//end class AbstractRequest