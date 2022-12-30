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

    private _channelId!: Snowflake;
    private _userId: Snowflake;

    protected _ready: boolean;
    protected _started: boolean;
    protected _paused: boolean;
    protected _resourceUrl: string | undefined;
    protected _title: string | undefined;
    protected _creator: string | undefined;
    protected _length: number | undefined;
    protected _lengthFormatted: string | undefined;
    protected _thumbnailUrl: string | undefined;

    /**The audio player currently playing this request. Undefined when not playing.
     * @see https://discord.js.org/#/docs/voice/main/class/AudioPlayer
    */
    protected player: AudioPlayer | undefined = undefined;
    /**The audio resource created from this request. Undefined until play has started.
     * @see https://discord.js.org/#/docs/voice/main/class/AudioResource
     */
    protected resource: AudioResource | undefined = undefined;

    /**The input to build this request from. */
    public readonly input: string;

    /**Creates a new request.
     * @param {string} input The input to build this request from.
     * @param {Snowflake} userId The ID of the user who made this request.
     * @param {Snowflake} channelId The ID of the channel in which to play this request.
     * @throws {@link UnresolvedUserError} When the requester's user ID does not resolve to a known user.
     * @throws {@link UnresolvedChannelError} When channelId is invalid, see linked documentation.
     * @throws {@link NonVoiceChannelError} When channelId is invalid, see linked documentation.
     * @see {@link Request.channelId} for circumstances in which channelId may be invalid.
     */
    constructor( input: string, userId: Snowflake, channelId: Snowflake ) {
        this.channelId = channelId;

        if ( !globalThis.client.users.resolve( userId ) )
            throw new UnresolvedUserError( `Unable to resolve request owner user ID (ID: ${userId})`, );
        else
            this._userId = userId;

        this.input = input;

        this._ready = false;
        this._started = false;
        this._paused = false;
    }//end constructor

    /**The ID of the channel in which to play this request. */
    public get channelId() {
        return this._channelId;
    }//end getter channelId

    /**
     * @throws {@link UnresolvedChannelError} When set to an ID that does not resolve to a known channel.
     * @throws {@link NonVoiceChannelError} When set to an ID that does not correspond to a voice-based channel.
     */
    public set channelId( newId: Snowflake ) {
        let resultChannel = globalThis.client.channels.resolve( newId );

        if ( !resultChannel )
            throw new UnresolvedChannelError( `Unable to resolve request playback channel ID (ID: ${newId})` );
        else if ( !resultChannel.isVoiceBased() )
            throw new NonVoiceChannelError( `The target channel "${resultChannel}" is not a voice-based channel` );

        this._channelId = newId;
    }//end setter channelId

    /**The ID of the user who made this request. */
    public get userId() {
        return this._userId;
    }//end getter userId

    /**Whether this request is currently considered usable. */
    public get ready() {
        return this._ready;
    }//end getter ready

    /**Whether this request has begun playback yet or not. */
    public get started() {
        return this._started;
    }//end getter started

    /**Whether this request is currently paused or not. */
    public get paused() {
        return this._paused;
    }//end getter paused

    /**The URL of this request's underlying resource. Undefined until request is ready.*/
    public get resourceUrl() {
        return this._resourceUrl;
    }//end getter resourceUrl

    /**The title of this request. Undefined until request is ready. */
    public get title() {
        return this._title;
    }//end getter title

    /**The attributed creator of this request's underlying resource. Undefined until request is ready. */
    public get creator() {
        return this._creator;
    }//end getter creator

    /**The total length of this request's underlying resource. Undefined until request is ready. `Infinity` if request is a live stream. */
    public get length() {
        return this._length;
    }//end getter length

    /**Formatted string for the total length of this request's underlying resource. Undefined until request is ready. */
    public get lengthFormatted() {
        return this._lengthFormatted;
    }//end getter lengthFormatted

    /**The URL of the thumbnail of this request's underlying resource. Undefined until request is ready. */
    public get thumbnailUrl() {
        return this._thumbnailUrl;
    }//end getter thumbnailUrl

    /**Initializes asynchronously-filled properties and marks this request as ready to be used. 
     * @see {@link YouTubeVideoRequest.init} and other concrete implementing classes for exact errors thrown.
     * @async
     */
    public async init(): Promise<void> {
        throw new Error( "Method not implemented." );
    }//end method init

    /**Plays the associated resource with this request on the supplied audio player.
     * @param {AudioPlayer} player The Audio Player through which the request should be played.
     * @see https://discord.js.org/#/docs/voice/main/class/AudioPlayer
     * @async
     */
    public async play( player: AudioPlayer ): Promise<void> {
        throw new Error( "Method not implemented." );
    }//end method play

    /**Pauses this request if it is currently playing.
     * @async
     */
    public async pause(): Promise<void> {
        throw new Error( "Method not implemented." );
    }//end method pause

    /**If this request is paused, resumes playing on the previously used Audio Player.
     * @async
     */
    public async resume(): Promise<void> {
        throw new Error( "Method not implemented." );
    }//end method resume

}//end class AbstractRequest