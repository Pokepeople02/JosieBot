import { AudioPlayer, AudioPlayerError, AudioPlayerState, AudioPlayerStatus, createAudioPlayer, getVoiceConnection, joinVoiceChannel, VoiceConnection, VoiceConnectionState, VoiceConnectionStatus } from "@discordjs/voice";
import { ApplicationCommand, Collection, Guild, MessageCreateOptions, MessagePayload, Snowflake, TextBasedChannel, TextChannel, VoiceBasedChannel, VoiceState } from "discord.js";
import { NonTextChannelError } from "./errors/NonTextChannelError";
import { UnresolvedChannelError } from "./errors/UnresolvedChannelError";
import { UnresolvedGuildError } from "./errors/UnresolvedGuildError";
import { Request } from "./requests/Request";
import { Mode } from "./Mode";
import { TimeoutError } from "./errors/TimeoutError";
import { EmbedBuilder } from "@discordjs/builders";

/**Represents the relationship between bot and guild. Stores information and carries out core bot activities. */
export class GuildContract {

    private _homeId: Snowflake | null = null;
    private _mode: Mode = Mode.Idle;
    private _prevMode: Mode = Mode.Idle;
    private _queue: Array<Request> = [];
    /**Audio Player attached to the voice connection of the associated guild.
     * @see https://discord.js.org/#/docs/voice/main/class/AudioPlayer
     */
    private audioPlayer: AudioPlayer = createAudioPlayer();
    /**Timer for transitioning to the next mode, when applicable. Null when current mode does not time out.
     * @see {@link Mode} for documentation of which bot modes feature timeout transitions.
     */
    private modeTimer: NodeJS.Timeout | null = null;
    /**Flag for whether voice connection listeners have been set yet. */
    private areVoiceListenersSet: boolean = false;

    /**The guild's ID. */
    readonly guildId: Snowflake;

    /**Creates a new contract.
     * @param {Snowflake} guildId The ID of the associated guild.
     */
    constructor( guildId: Snowflake ) {
        if ( !globalThis.client.guilds.resolve( guildId ) )
            throw new UnresolvedGuildError( `Contracted guild ID ${guildId} does not resolve to a valid guild` );

        globalThis.client.log( `Created new contract for this guild.`, guildId );

        this.guildId = guildId;

        this.audioPlayer.on( "error", ( error: AudioPlayerError ) => {
            globalThis.client.log( `Audio player error: ${error}`, this.guildId );
            this.sendPlayerError( error );
            this.skip( 1 );
        } );

        this.audioPlayer.on( AudioPlayerStatus.Idle, ( _prev: any, _curr: any ) => {
            this.skip( 1 );
        } );
    }//end constructor

    /**A shallow copy of the guild's stored active queue. The current request, if `Playing`, is the first item in the queue. */
    public get queue(): Array<Request> {
        return this._queue.slice();
    }//end getter queue

    /**The current mode of the bot for this guild.
     * @see {@link Mode} for meanings of particular Mode values.
     */
    public get currentMode(): Mode {
        return this._mode;
    }//end getter mode

    /**The previous mode of the bot. Initial value is `Idle`.
     * @see {@link Mode} for meanings of particular Mode values.
     */
    public get previousMode(): Mode {
        return this._prevMode;
    }//end getter previousMode

    /**Channel ID of the guild's home channel. Defaults to null.
     * If the current home channel no longer exists, getting the value will update it to null.
     */
    public get homeId(): Snowflake | null {
        if ( this._homeId !== null && !globalThis.client.channels.resolve( this._homeId ) )
            this._homeId = null;

        return this._homeId;
    }//end getter homeId

    /**Sends a 'Now Playing...' message upon being successfully set.
     * @throws {@link UnresolvedChannelError} When set to a non-null ID that is unable to be resolved to a known channel.
     * @throws {@link NonTextChannelError} When set to a non-null ID that does not correspond to a text-based channel.
     */
    public set homeId( homeId: Snowflake | null ) {
        let channel;

        if ( homeId ) {
            channel = globalThis.client.channels.resolve( homeId );

            if ( !channel )
                throw new UnresolvedChannelError( `Home ID is not resolvable (ID: ${homeId})` );
            else if ( !channel.isTextBased() )
                throw new NonTextChannelError( `"Requested home channel "${channel}" is not text-based` );

        }//end if

        this._homeId = homeId;

        if ( this.currentMode === Mode.Playing )
            this.sendNowPlaying();
    }//end setter homeId

    /**
     * The current request, if the bot is {@link Mode.Playing Playing}, {@link Mode.Paused Paused}, or on {@link Mode.Standby Standby}.
     * Otherwise, if the bot is {@link Mode.Waiting Waiting} or {@link Mode.Idle Idle}, null.
     */
    public get currentRequest(): Request | null {
        if ( this.currentMode === Mode.Waiting || this.currentMode === Mode.Idle )
            return null;

        return this._queue[0];
    }//end getter currentRequest

    /**Adds a new request to the queue. If this is the first request in the queue, begins playing.
     * @remark Adding a request at an out-of-bounds index will instead be added to either the beginning or the end of the queue, whichever is appropriate.
     * @param {Request} request The request to be added.
     * @param {number} index The index to add the request at. Defaults to the end of the queue. Does not replace existing requests. 
     */
    public async add( request: Request, index: number = this._queue.length ): Promise<void> {
        const guild = globalThis.client.guilds.resolve( this.guildId )!;
        index = Math.min( Math.max( index, 0 ), this._queue.length );

        this._queue.splice( index, 0, request );
        globalThis.client.log( `"${request.title}" successfully added to queue at index ${index}.`, this.guildId );

        if ( this._queue.length === 1 && !( await this.play() ) ) {

            if ( guild.members.me!.voice.channel ) this.wait(); //Successful join but not play
            else this.idle();

        }//end if

        return;
    }//end method add

    /**Removes a request from the queue at the given index, if one exists.
     * @remark Removing a request at an out-of-bounds index does nothing, while removing the current request
     * forces a transition to the next.
     * @param {number} index The index of the request to be removed.
     */
    public async remove( index: number ): Promise<void> {
        let removed;

        if ( index < 0 || index > this._queue.length - 1 )
            return;

        //Special case
        if ( index === 0 ) {
            await this.skip( 1 );
            return;
        }//end if

        removed = this._queue[index];
        this._queue.splice( index, 1 );
        globalThis.client.log( `"${removed.title}" successfully removed from queue at index ${index}.`, this.guildId );

        return;
    }//end method remove

    /**Skips to and plays the next request with the minimum specified index.
     * @param {number} minIndex The first index to begin looking for a valid request at.
     * @returns {boolean} True if able to begin `Playing` after skipping. if not, false.
     */
    public async skip( minIndex: number = 1 ): Promise<boolean> {
        this.skipTo( minIndex );
        await this.transition();

        return this._mode === Mode.Playing;
    }//end method skip

    /**Attempts to move the bot into the voice channel with the specified ID.
     * @remark
     * If not yet set, sets up the voice connection listeners for error and disconnection.
     * @param {Snowflake} channelId The ID of the voice channel to join.
     * @returns {boolean} True if able to successfully join the requested channel. Otherwise, false.
     * @throws {UnresolvedChannelError} If unable to resolve the given ID.
     * @throws {NonVoiceChannelError} If ID given does not correspond to a voice-based channel.
     */
    public move( channelId: Snowflake ): boolean {
        const channel = globalThis.client.channels.resolve( channelId );
        const guild = globalThis.client.guilds.resolve( this.guildId )!;
        let connection: VoiceConnection;

        if ( !channel )
            throw new UnresolvedChannelError( `Channel ID is not resolvable (ID: ${channelId})` );
        else if ( !channel.isVoiceBased() )
            throw new NonTextChannelError( `Channel "${channel}" is not voice-based` );

        connection = joinVoiceChannel( {
            channelId: channelId,
            guildId: this.guildId,
            adapterCreator: guild.voiceAdapterCreator,
        } );

        if ( !connection )
            return false;

        globalThis.client.log( `Moved into channel.`, this.guildId, channelId );

        if ( !this.areVoiceListenersSet )
            this.setupVoiceConnListeners();

        return true;
    }//end method move

    /**Attempts to pause the current request, if currently `Playing`. Otherwise, does nothing.
     * @remark
     * If an error occurs while trying to pause the current request, sends an "Error Occurred when Pausing Request" message and does nothing.
     */
    public async pause(): Promise<void> {
        if ( this._mode !== Mode.Playing )
            return;

        try { await this._queue[0].pause(); }
        catch ( error ) {
            globalThis.client.log( `Pause error for "${this._queue[0]?.title ?? "unknown request"}": ${error}`, this.guildId );
            this.sendPauseError( error as Error );
            return;
        }//end try-catch


        this._prevMode = this._mode;
        this._mode = Mode.Paused;
        globalThis.client.log( "Bot is now Paused", this.guildId );

        if ( this.modeTimer )
            clearTimeout( this.modeTimer );
        this.modeTimer = null;

        return;
    }//end method pause

    /**Attempts to resume `Playing` for the current request, if currently `Paused`. Otherwise, does nothing. */
    public async resume(): Promise<void> {
        if ( this._mode !== Mode.Paused )
            return;

        this._prevMode = this._mode;
        this._mode = Mode.Playing;
        globalThis.client.log( "Bot has resumed Playing", this.guildId );

        if ( !( await this.play() ) ) {
            this.skip( 1 );
        }//end if

        if ( this.modeTimer )
            clearTimeout( this.modeTimer );
        this.modeTimer = null;

        return;
    }//end method resume

    /**Activated whenever a change has happened in the voice state for any guild the bot occupies.
     * Determines whether the bot should enter or exit `Standby` mode for the originating guild, and takes action accordingly.
     * @param {VoiceState} prev The previous VoiceState of the bot in the originating guild.
     * @param {VoiceState} curr The current VoiceState of the bot in the originating guild.
     * @see https://discord.js.org/#/docs/discord.js/main/class/VoiceState For the behavior of discord.js VoiceStates.
     */
    static async standbyToggle( prev: VoiceState, curr: VoiceState ): Promise<void> {
        const contract = globalThis.client.contracts.get( curr.guild.id );
        const botChannel = curr.guild.members.me!.voice.channel;

        if ( !contract )
            return;

        //Pre-emptive check if need to force idle
        if ( !botChannel && contract.currentMode !== Mode.Idle ) {
            contract.idle();
            return;
        }//end if

        switch ( contract.currentMode ) {
            case Mode.Idle:
                break; //Ignore
            case Mode.Standby:

                //Either bot joined populated channel or user joined bot's unpopulated channel
                if ( botChannel && botChannel.members.size > 1 )
                    await contract.endStandby();

                break;
            case Mode.Waiting:
            case Mode.Paused:
            case Mode.Playing:

                //Either bot joined unpopulated channel or last user left bot's unpopulated channel
                if ( botChannel && botChannel.members.size === 1 )
                    await contract.startStandby();

        }//end switch

        return;
    }//end method standbyToggle

    /**Pauses the current request if one is playing and starts a timer for transitioning to `Idle` mode.
     * Updates the mode to `Standby`.
     * @remark If already on Standby, does nothing. Clears any mode timers that have been set otherwise.
     */
    private async startStandby(): Promise<void> {
        if ( this._mode === Mode.Standby )
            return;

        this._prevMode = this._mode;
        this._mode = Mode.Standby;
        globalThis.client.log( "Bot is now on Standby", this.guildId );

        if ( this._prevMode === Mode.Playing ) {

            try { await this._queue[0].pause(); }
            catch ( error ) {
                globalThis.client.log( `Standby pause error for "${this._queue[0]?.title ?? "unknown request"}": ${error}`, this.guildId );
                this.sendStandbyError( error as Error );
            }//end try-catch

        }//end if

        if ( this.modeTimer )
            clearTimeout( this.modeTimer );

        this.modeTimer = setTimeout( () => {
            this.idle();
        }, globalThis.standbyTimeout );

        return;
    }//end method startStandby

    /**Returns from `Standby` mode to the previous mode, and resumes the behavior appropriate to that mode. 
     * @remark 
     * If previously `Playing`, resumes playing the current request.
     * 
     * If previously `Paused`, continues being paused, and sends a `Bot is Currently Paused` message reminder.
     * 
     * If previously `Waiting`, resets the mode timer and continues waiting.
     * 
     * Otherwise, failsafes to `Idle` mode.
     * 
    */
    private async endStandby(): Promise<void> {

        switch ( this._prevMode ) {
            case Mode.Playing:
                let botVoiceChannel = globalThis.client.guilds.resolve( this.guildId )!.members.me!.voice.channel;

                //Handles edge case where bot was moved from original channel
                if ( botVoiceChannel && ( this._queue[0]?.channelId !== botVoiceChannel.id ) ) {
                    this._queue[0].channelId = botVoiceChannel.id;
                }//end if

                if ( !await this.play() ) {
                    this.transition();
                }//end if

                break;
            case Mode.Paused:
                await this.pause();
                this.sendPaused();
                break;
            case Mode.Waiting:
                this.wait();
                break;
            default:
                this.idle();
        }//end switch

        return;
    }//end method endStandby

    /**Skip a minimum number of requests between the currently playing one (if exists) and the next valid request.
     * Does not affecting the currently playing request or the current mode.
     * @remark 
     * A valid request is one to be played in an existant voice channel populated by at least one non-bot user.
     * 
     * A min number of requests of 0 or less does nothing.

     * A minimum number of requests of queue#length or greater will empty the queue, save for the currently playing request.
     * @param {number} numRequests The first index at which to look for a valid request.
     * @return {Array<Request>} An array containing the skipped requests, in the order they were skipped.
     */
    private skipTo( numRequests: number ): Array<Request> {
        let queue = this.queue;
        let current: Request | null = null;
        let skipped: Array<Request> = [];

        if ( numRequests <= 0 || queue.length === 0 )
            return skipped;

        if ( this._mode !== Mode.Waiting && this._mode !== Mode.Idle ) {
            current = queue.shift()!;
            numRequests--;
        }//end if

        for ( let i = 0; queue[0] && i < numRequests; ++i )
            skipped.push( queue.shift()! );

        while ( queue[0] ) {
            let reqChannel = globalThis.client.channels.resolve( queue[0].channelId );

            if ( reqChannel && this.isChannelPopulated( reqChannel.id ) )
                break;

            skipped.push( queue.shift()! );
        }//end while

        if ( current )
            queue.unshift( current );
        this._queue = queue;

        globalThis.client.log( `Skipped ${skipped.length} ${skipped.length === 1 ? "entry" : "entries"} in queue.`, this.guildId );

        return skipped;
    }//end skipTo

    /**Shifts the immediate request off the queue and attempts to transition to the next request. 
     * If the queue is empty, transitions to `Waiting` if currently in a voice channel, or `Idle` if not.
     * @remark
     * Does not check for the validity of the next request before transitioning.
     * 
     * Does nothing outside of `Playing`, `Paused`, and `Standby` modes.
     */
    private async transition(): Promise<void> {
        const guild = globalThis.client.guilds.resolve( this.guildId )!;

        if ( !( this._mode === Mode.Playing || this._mode === Mode.Paused || this._mode === Mode.Standby ) )
            return;

        globalThis.client.log( "Transitioning to next request", this.guildId );

        this._queue.shift();

        if ( this._queue.length !== 0 ) {

            if ( !( await this.play() ) ) {
                this.skip( 1 );
            }//end if

        } else if ( guild.members.me!.voice.channel ) {
            this.wait();
        } else { //Failsafe to idle
            this.idle();
        }//end if-else

        return;
    }//end method transition

    /**Attempts to join the appropriate channel and play the immediate request at the top of the queue, 
     * setting the mode to `Playing` if successful and not already.
     * @remark 
     * If successful, clears any mode timer that has been set and sends a `Now Playing...` message.
     * 
     * If current request has already began being played, resumes playback instead of restarting it.
     * @returns {Promise<boolean>} True if successful. False if unsuccessful, or if queue is empty.
     * @async
     */
    private async play(): Promise<boolean> {
        const currRequest = this._queue[0];
        let voiceId: Snowflake | undefined;

        if ( this._queue.length === 0 )
            return false;

        if ( !this.move( currRequest.channelId ) )
            return false;

        try {

            try {
                await currRequest.resume();
            } catch {
                await Promise.race( [currRequest.play( this.audioPlayer ), new Promise( ( _resolve, reject ) => {
                    setTimeout( () => { reject( new TimeoutError( "Audio Resource creation timed out" ) ); }, globalThis.promiseTimeout );
                } )] );

            }//end try-catch

            voiceId = globalThis.client.guilds.resolve( this.guildId )!.members.me?.voice.channelId ?? undefined;
            globalThis.client.log( `Now playing "${currRequest.title}"`, this.guildId, voiceId );
        } catch ( error ) {
            this.sendRequestError( error as Error );
            globalThis.client.log( `Play/Resume error for "${currRequest.title ?? "unknown request"}": ${error}`, this.guildId );
            return false;
        }//end try-catch

        if ( this._mode !== Mode.Playing ) {
            this._prevMode = this._mode;
            this._mode = Mode.Playing;
            globalThis.client.log( "Bot is now Playing", this.guildId );
        }//end if

        if ( this.modeTimer ) {
            clearTimeout( this.modeTimer );
            this.modeTimer = null;
        }//end if

        this.sendNowPlaying();

        //If playing in empty channel, start standby immediately
        if ( voiceId && ( globalThis.client.channels.resolve( voiceId )! as VoiceBasedChannel ).members.size === 1 )
            await this.startStandby();

        return true;
    }//end method play

    /**Clears the queue, stops the audio player, and starts a timer for transitioning to `Idle` mode.
     * Updates the mode to `Waiting`.
     * @remark If already `Waiting`, does nothing. 
     */
    private wait(): void {
        if ( this._mode === Mode.Waiting )
            return;

        this._prevMode = this._mode;
        this._mode = Mode.Waiting;
        globalThis.client.log( "Bot is now Waiting", this.guildId );

        this._queue = [];
        this.audioPlayer.stop();

        if ( this.modeTimer )
            clearTimeout( this.modeTimer );

        this.modeTimer = setTimeout( () => {
            this.idle();
        }, globalThis.waitingTimeout );

        return;
    }//end method wait

    /**Clears the queue, stops the audio player, and destroys any voice connection.
     * Updates the mode to `Idle`.
     * @remark Clears any mode timers that have been set.
     */
    private idle(): void {
        if ( this._mode === Mode.Idle )
            return;

        this._prevMode = this._mode;
        this._mode = Mode.Idle;
        globalThis.client.log( "Bot is now Idle", this.guildId );

        if ( this.modeTimer )
            clearTimeout( this.modeTimer );

        this._queue = [];
        getVoiceConnection( this.guildId )?.destroy();
        this.audioPlayer.stop( true );

        return;
    }//end method idle

    /**Sends the 'Now Playing...' message to the guild's home channel, if one exists. */
    private sendNowPlaying(): void {
        const currRequest = this.queue[0];
        const requestString = currRequest.resourceUrl ? "[" + currRequest.title + "](" + currRequest.resourceUrl + ")" : "unknown";
        const requestChannel = globalThis.client.channels.resolve( currRequest.channelId ?? "0" );
        const requestingUser = globalThis.client.users.resolve( currRequest.userId );

        this.sendHomeChannelMessage(
            `Now playing ${requestString} in ${requestChannel?.toString() ?? "unknown"}\n` +
            `<queued by ${requestingUser?.toString() ?? "unknown user"}>`
        );

        globalThis.client.log( "Attempted to send 'Now Playing' message.", this.guildId, this.homeId ?? undefined );

        return;
    }//end method sendNowPlaying

    /**Sends the 'Bot is Currently Paused' message to the guild's home channel, if one exists. */
    private async sendPaused(): Promise<void> {
        const currentChannel = globalThis.client.guilds.resolve( this.guildId )!.members.me!.voice.channel;
        const commands: Collection<Snowflake, ApplicationCommand> = await globalThis.client.application!.commands.fetch();
        const resumeId: Snowflake = commands.filter( command => command.name === "resume" ).first()!.id;
        const skipId: Snowflake = commands.filter( command => command.name === "skip" ).first()!.id;

        this.sendHomeChannelMessage(
            "Currently paused" + ( currentChannel ? ` in ${currentChannel.toString()}` : "" ) + ".\n" +
            `Use </resume:${resumeId}> to continue playing or </skip:${skipId}> to skip to the next request.`
        );

        globalThis.client.log( "Attempted to send 'Currently Paused' message.", this.guildId, this.homeId ?? undefined );

        return;
    }//end method sendPaused

    /**Sends the 'Error Occurred when Playing Request' message to the guild's home channel, if one exists.
     * @param {Error} error The error that has occurred.
     */
    private sendRequestError( error: Error ): void {

        this.sendHomeChannelMessage(
            "An error occurred when attempting to play the next request! Skipping to the next request, if one exists.\n" +
            `Error message:\n\`${error.message.substring( 0, 1500 )}\`\n` +
            `Kindly throw this at <@258387135932006410> and try to explain to him how it happened.`
        );

        globalThis.client.log( "Attempted to send 'Play Error' message.", this.guildId, this.homeId ?? undefined );

        return;
    }//end method sendRequestError

    /**Sends the 'Error Occurred when Pausing Request' message to the guild's home channel, if one exists.
     * @param {Error} error The error that has occurred.
     */
    private sendPauseError( error: Error ): void {

        this.sendHomeChannelMessage(
            "An error occurred when attempting to pause the current request! The request could not be paused.\n" +
            `Error message:\n\`${error.message.substring( 0, 1500 )}\`\n` +
            `Kindly throw this at <@258387135932006410> and try to explain to him how it happened.`
        );

        globalThis.client.log( "Attempted to send 'Pause Error' message.", this.guildId, this.homeId ?? undefined );

        return;
    }//end method sendPauseError

    /**Sends the 'Error Occurred when Pausing Request for Standby Mode' message to the guild's home channel, if one exists.
     * @param {Error} error The error that has occurred.
     */
    private sendStandbyError( error: Error ): void {

        this.sendHomeChannelMessage(
            "An error occurred when attempting to temporarily pause the current request for standby! The request could not be paused.\n" +
            `Error message:\n\`${error.message.substring( 0, 1500 )}\`\n` +
            `Kindly throw this at <@258387135932006410> and try to explain to him how it happened.`
        );

        globalThis.client.log( "Attempted to send 'Standby Error' message.", this.guildId, this.homeId ?? undefined );

        return;
    }//end method sendStandbyError

    /**Sends 'Error Occurred with Audio Player' message to the guild's home channel, if one exists.
     * @param {Error} error The error that has occurred.
     */
    private sendPlayerError( error: Error ): void {

        this.sendHomeChannelMessage(
            "An error occurred with the audio player! Skipping to the next request, if one exists.\n" +
            `Error message:\n\`${error.message.substring( 0, 1500 )}\`\n` +
            `Kindly throw this at <@258387135932006410> and try to explain to him how it happened.`
        );

        globalThis.client.log( "Attempted to send 'Player Error' message.", this.guildId, this.homeId ?? undefined );

        return;
    }//end method sendPlayerError

    /**Sends the 'Error Occurred with Voice Connection' message to the guild's home channel, if one exists.
     * @param {Error} error The error that has occurred.
    */
    private sendConnectionError( error: Error ): void {

        this.sendHomeChannelMessage(
            "An error occurred with the voice connection! Skipping to the next request, if one exists.\n" +
            `Error message:\n\`${error.message.substring( 0, 1500 )}\`\n` +
            `Kindly throw this at <@258387135932006410> and try to explain to him how it happened.`
        );

        globalThis.client.log( "Attempted to send 'Connection Error' message.", this.guildId, this.homeId ?? undefined );

        return;
    }//end method sendConnectionError

    /**Attempts to send a message to the guild's home channel, if one exists.
     * @param contents The contents of the message
     */
    private sendHomeChannelMessage( message: string ) {
        const homeChannel = this.homeId ? globalThis.client.channels.resolve( this.homeId ) as TextChannel | null : null;

        if ( homeChannel ) {

            try {
                homeChannel.send( {
                    embeds: [
                        new EmbedBuilder()
                            .setDescription( message )
                    ]
                } );
            } catch ( error: unknown ) {
                globalThis.client.log( "Failed to send home channel message. Error:\n" + error, this.guildId, homeChannel.id );
            }//end try-catch

        }//end if

        return;
    }//end method sendHomeChannelMessage

    /**Determines if a channel is populated by non-bot users.
     * @param {Snowflake} channelId The ID of the channel examined.
     * @return {boolean} True if ID corresponds to voice channel that is populated by at least one non-bot user. Otherwise, false.
     */
    private isChannelPopulated( channelId: Snowflake ): boolean {
        const botChannel = globalThis.client.guilds.resolve( this.guildId )!.members.me!.voice.channel;
        const target = globalThis.client.channels.resolve( channelId );

        if ( !target || !target.isVoiceBased() )
            return false;

        return ( botChannel?.id !== channelId && target.members.size > 0 ) || ( botChannel?.id === channelId && target.members.size > 1 );
    }//end method isChannelPopulated

    /**Sets up permanent listeners for the guild's voice connection and subscribes the voice connection to the audio player. 
     * @remark
     * On voice connection error, send the appropriate message and transition.
     * 
     * On voice connection destroyed or disconnected, failsafe to `Idle` mode if not already.
     * @see https://discord.js.org/#/docs/voice/main/typedef/VoiceConnectionStatus For information about voice connection statuses.
      */
    private setupVoiceConnListeners(): void {
        const voiceConn = getVoiceConnection( this.guildId );

        if ( this.areVoiceListenersSet || !voiceConn )
            return;

        voiceConn.subscribe( this.audioPlayer );

        voiceConn.on( 'error', ( error: Error ) => {
            globalThis.client.log( `Error in voice connection: ${error}` );
            this.sendConnectionError( error );
            this.transition();
        } );

        voiceConn.on( VoiceConnectionStatus.Destroyed, ( _prev: any, _curr: any ) => {
            globalThis.client.log( "Voice connection has been destroyed.", this.guildId );
            this.areVoiceListenersSet = false;
        } );

        //Workaround for discord.js error
        voiceConn.on( 'stateChange', ( oldState, newState ) => {
            if ( oldState.status === VoiceConnectionStatus.Ready && newState.status === VoiceConnectionStatus.Connecting ) {
                voiceConn.configureNetworking();
            }//end if
        } );

        globalThis.client.log( "Set voice connection listeners successfully", this.guildId );
        this.areVoiceListenersSet = true;
        return;
    };//end method setupVoiceConnListeners

}//end class GuildContract