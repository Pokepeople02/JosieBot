import { AudioPlayer, AudioResource } from "@discordjs/voice";
import { Snowflake } from "discord.js";
import { DurationError } from "../errors/DurationError";
import { NonVoiceChannelError } from "../errors/NonVoiceChannelError";
import { UnresolvedChannelError } from "../errors/UnresolvedChannelError";
import { UnresolvedUserError } from "../errors/UnresolvedUserError";
import { Request } from "./Request";
import { createRequest } from "./RequestFactory";

/**Base for children classes representing concrete request types.
 * @remark After initialization of concrete child classes, asynchronously obtained fields are filled via {@link init()} before  the request is considered ready. It is recommended that the instantiation and initialization of concrete children request types should  be done exclusively through the factory method {@link createRequest()} for ease of use.
 * @implements Request
 * @see {@link createRequest()}
*/
export abstract class AbstractRequest implements Request {

    public readonly input: string;
    private _channelId!: Snowflake;
    private _start: number = 0;
    private _end: number = Infinity;
    private _userId: Snowflake;
    protected _ready: boolean;
    protected _started: boolean;
    protected _resourceUrl: string | undefined;
    protected _title: string | undefined;
    protected _creator: string | undefined;
    protected _length: number | undefined;
    protected _thumbnailUrl: string | undefined;

    /**The audio player currently playing this request. Undefined when not playing.
     * @see https://discord.js.org/#/docs/voice/main/class/AudioPlayer
    */
    protected player: AudioPlayer | undefined = undefined;
    /**The audio resource created from this request. Undefined until play has started.
     * @see https://discord.js.org/#/docs/voice/main/class/AudioResource
     */
    protected resource: AudioResource | undefined = undefined;

    /**Creates a new request.
     * @param {string} input The input to build this request from.
     * @param {Snowflake} userId The ID of the user who made this request.
     * @param {Snowflake} channelId The ID of the channel in which to play this request.
     * @param {number} start The duration into this request to begin playback. When greater than end, the two are swapped.
     * @param {number} end The duration into this request to stop playback. When less than start, the two are swapped.
     * @throws {@link UnresolvedUserError} When the requester's user ID does not resolve to a known user.
     * @throws {@link DurationError} When start or end are not in a valid range, see linked documentation.
     * @throws {@link UnresolvedChannelError} When channelId is invalid, see linked documentation.
     * @throws {@link NonVoiceChannelError} When channelId is invalid, see linked documentation.
     * @see {@link start} and {@link end} for the valid ranges of their respective values.
     * @see {@link AbstractRequest.channelId} for circumstances in which channelId may be invalid.
     */
    constructor( input: string, userId: Snowflake, channelId: Snowflake, start: number, end: number ) {
        this.channelId = channelId;

        if ( !globalThis.client.users.resolve( userId ) )
            throw new UnresolvedUserError( `Unable to resolve request owner user ID (ID: ${userId})`, );
        else
            this._userId = userId;

        this.input = input;

        if ( start > end ) {
            this.start = end;
            this.end = start;
        } else {
            this.start = start;
            this.end = end;
        }//end if-else

        this._ready = false;
        this._started = false;
    }//end constructor

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

    public get start() {
        return this._start;
    }//end getter start

    /**@throws {@link DurationError} When set to a value that is less than 0, greater than {@link end}, or greater than {@link length}. */
    public set start( newStart: number ) {
        if ( newStart < 0 || newStart > this._end || ( this._length && newStart > this._length ) )
            throw new DurationError( `The requested start (${newStart}) is not in a valid range` );

        this._start = newStart;
    }//end setter start

    public get end() {
        return this._end;
    }//end getter end

    /**@throws {link DurationError} When set to a value that is less than 0, less than {@link start}, or greater than {@link length}. */
    public set end( newEnd: number ) {
        if ( newEnd < 0 || newEnd < this._start || ( this._length && newEnd > this._length ) )
            throw new DurationError( `The requested end (${newEnd}) is not in a valid range` );

        this._end = newEnd;
    }//end setter end

    public get userId() {
        return this._userId;
    }//end getter userId

    public get ready() {
        return this._ready;
    }//end getter ready

    public get started() {
        return this._started;
    }//end getter started

    public get resourceUrl() {
        return this._resourceUrl;
    }//end getter resourceUrl

    public get title() {
        return this._title;
    }//end getter title

    public get creator() {
        return this._creator;
    }//end getter creator

    public get length() {
        return this._length;
    }//end getter length

    public get thumbnailUrl() {
        return this._thumbnailUrl;
    }//end getter thumbnailUrl

    public async init(): Promise<void> {
        throw new Error( "Method not implemented." );
    }//end method init

    public async play( player: AudioPlayer ): Promise<void> {
        throw new Error( "Method not implemented." );
    }//end method play

    public async pause(): Promise<void> {
        throw new Error( "Method not implemented." );
    }//end method pause

    public async resume(): Promise<void> {
        throw new Error( "Method not implemented." );
    }//end method resume

}//end class AbstractRequest