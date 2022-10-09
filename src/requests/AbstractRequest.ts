import { AudioPlayer, AudioResource } from "@discordjs/voice";
import { Snowflake } from "discord.js";
import { Request } from "./Request";

/**A base from which children representing different request types can be built.*/
export abstract class AbstractRequest implements Request {

    public readonly input: string;
    private _channelId!: Snowflake;
    private _start: number = 0;
    private _end: number = Infinity;
    private _userId: Snowflake;
    protected _ready: boolean;
    protected _resourceUrl: string | undefined;
    protected _title: string | undefined;
    protected _creator: string | undefined;
    protected _length: number | undefined;
    protected _thumbnailUrl: string | undefined;

    /**The discord.js Audio Player which is playing the request. Undefined when not being played. */
    protected player: AudioPlayer | undefined = undefined;
    /**The discord.js AudioResource obtained for the request. */
    protected resource: AudioResource | undefined = undefined;

    /**Creates a new request with the specified fields. Child classes are responsible for validating their own input during construction.
     * @param input The string this request was built from.
     * @param userId The ID of the user who made this request.
     * @param channelId The ID of the channel in which this request is to be played.
     * @param start The duration into the request to begin playing.
     * @param end The duration into the request to stop playing.
     */
    constructor( input: string, userId: Snowflake, channelId: Snowflake, start: number, end: number ) {
        this.channelId = channelId;

        if ( !globalThis.client.users.resolve( userId ) )
            throw new Error( "User ID is unable to be resolved to a valid user" );
        else
            this._userId = userId;

        this.input = input;

        if ( start > end )
            throw new Error( `Requested start "${start}" contradicts requested end "${end}"` );
        else {
            this.start = start;
            this.end = end;
        }//end if-else

        this._ready = false;
    }//end constructor

    public get channelId() {
        return this._channelId;
    }//end getter channelId

    public set channelId( newId: Snowflake ) {
        let resultChannel = globalThis.client.channels.resolve( newId );

        if ( !resultChannel )
            throw new Error( "The target channel ID is unable to be resolved to a valid channel" );
        else if ( !resultChannel.isVoiceBased() )
            throw new Error( "The target channel ID is not a voice-based channel" );

        this._channelId = newId;
    }//end setter channelId

    public get start() {
        return this._start;
    }//end getter start

    public set start( newStart: number ) {
        if ( newStart < 0 || newStart > this._end || ( this._length && newStart > this._length ) )
            throw new RangeError( "The requested start is not in a valid range" );

        this._start = newStart;
    }//end setter start

    public get end() {
        return this._end;
    }//end getter end

    public set end( newEnd: number ) {
        if ( newEnd < 0 || newEnd < this._start || ( this._length && newEnd > this._length ) )
            throw new RangeError( "The requested end is not in a valid range." );

        this._end = newEnd;
    }//end setter end

    public get userId() {
        return this._userId;
    }//end getter userId

    public get ready() {
        return this._ready;
    }//end getter ready

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

    public play( player: AudioPlayer ): Promise<void> {
        throw new Error( "Method not implemented." );
    }//end method play

    public pause(): Promise<void> {
        throw new Error( "Method not implemented." );
    }//end method pause

    public resume(): Promise<void> {
        throw new Error( "Method not implemented." );
    }//end method resume

}//end class AbstractRequest