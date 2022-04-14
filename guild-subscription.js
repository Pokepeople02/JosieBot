'use strict';

import { BaseGuildTextChannel }		from 'discord.js';
import { 
	AudioPlayerStatus,
	VoiceConnectionStatus,
	createAudioPlayer,
	getVoiceConnection,  
	joinVoiceChannel,
} 									from '@discordjs/voice';
import { Request } 					from './request.js';
import { Status } 					from './bot-status.js';
import { nowPlayingMessage } 		from './messages.js';

/*	Keeps track of guild-specific information for an instance of the bot, including a queue and the bot's current state.	*/
export class GuildSubscription {
	
	#guild;						//Guild object to which this subscription belongs.
	#botStatus = Status.Idle; 	//The current status of the bot for the subscription's guild.
	#audioPlayer; 				//Audio player attached to the voice connection of the subscription's guild.
	#queue = [];				//Queue of Resource objects corresponding to requests made in the subscription's guild.
	#queueLock = false;			//Flag to indicate whether the queue is locked for modification.
	#standbyTimerID = -1;		//ID of the current standby or waiting timer for the bot.
	#homeChannelID = null;		//Snowflake ID of the home channel in which the bot announces newly playing tracks.
	#standbyActivateListener; 	//Event listener for determining when to initiate transition to standby state.
	#standbyDeactivateListener;	//Event listener for determining when to abort standby and continue playing. 
	
	/* Creates a new GuildSubscription with a given guild and creates the attached audio player. */
	constructor( guild ) {
		console.log( `Creating new subscription for guild '${guild.name}'.` );
		
		this.#guild = guild; 
		this.#audioPlayer = createAudioPlayer(); 
		
		//Transition to next request when the current request ends
		this.#audioPlayer.on( 'stateChange', (oldState, newState) => {
			if( newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle ) {
				//If audio player becomes idle, the last played track has ended.
				console.log( 'Audio player transition to Idle from non-Idle state.' );
				
				if( this.#queue.length !== 0 )
					this.transition();
			}//end if
		} );
		
		//On audio player error, log the error.
		this.#audioPlayer.on( 'error', (error) => {
			console.log( 'Encountered error with current resource: ' + error.message );
		} );
		
		//	Unable to define as its own method due to private access strangeness beyond my understanding
		/*	Listens for voice state changes within this guild in which a change occurs to the channel the bot is occupying, leaving the bot alone in a vc.
			Upon such, transition to standby is initiated.
		*/
		this.#standbyActivateListener = ( oldState, newState ) => {
			//Disregard voice state changes not pertinent to this subscription.
			if( newState.guild.id !== this.#guild.id ) return;
			
			//Disregard if bot isn't in a vc
			if( !getVoiceConnection(this.#guild.id) ) return;
			
			//Disregard if bot isn't currently playing or paused
			if( !(this.#botStatus === Status.Playing || this.#botStatus === Status.Paused) ) return;
			
			if( (oldState.channelId === this.#guild.me.voice.channelId || newState.channelId === this.#guild.me.voice.channelId) && this.#guild.me.voice.channel.members.size < 2 ) {
				//There has been some change to the channel the bot is now in, and the bot is currently alone. Transition to standby.
				
				console.log( 'Standby activation listener: Detected change to bot voice channel that has rendered bot alone.' );
				this.standby();
			}//end if
		};
		
		//	Unable to define as its own method due to private access strangeness beyond my understanding
		/*	Listens for voice state changes within this guild in which a change occurs to the channel the bot is occupying, leaving the bot no longer alone in a vc.
			Upon such, transition to standby is aborted and a playing state is resumed.
		*/
		this.#standbyDeactivateListener = ( oldState, newState ) => {
			//Disregard voice state changes not pertinent to this subscription.
			if( newState.guild.id !== this.#guild.id ) return;
			
			//Disregard if bot isn't in a vc
			if( !getVoiceConnection(this.#guild.id) ) return;
			
			//Disregard if bot isn't currently on standby
			if( this.#botStatus !== Status.Standby ) return;
			
			if( (oldState.channelId === this.#guild.me.voice.channelId || newState.channelId === this.#guild.me.voice.channelId) && this.#guild.me.voice.channel.members.size > 1 ) {
				//There has been some change to the channel the bot is now in, and the bot is no longer alone.
				
				console.log( 'Standby deactivation listener: Detected change to bot voice channel that has made bot no longer alone.' );
				
				console.log( 'Reactivating standby activation listener' );
				globalThis.client.removeAllListeners( 'voiceStateUpdate' );
				globalThis.client.on( 'voiceStateUpdate', this.#standbyActivateListener );
				
				clearTimeout( this.#standbyTimerID );
				
				this.resume();
				this.#botStatus = Status.Playing;
			}//end if
		};
	}//end constructor method
	
	/*	Remove the currently playing request from the queue. Attempt to play the next, if one exists.	*/
	async transition() {
		console.log( 'Transitioning to next request.' );
		
		await this.skipToNextValid();
		
		if( this.#queue.length === 0 ) {
			//If the queue is now empty, stop and transition to waiting.
			this.#audioPlayer.stop( true );
			this.wait();
			
			return;
		}//end if
		
		this.play();
		
		return;
	}//end method transition
	
	/*	Clears the queue and standby timers, forces the audio player to stop and the bot to disconnect, and sets the bot status to Idle.	*/
	idle() {
		this.lockQueue( true );
		
		this.#queue = [];
		
		clearTimeout( this.#standbyTimerID );
		
		globalThis.client.removeAllListeners( 'voiceStateUpdate' );
		
		this.#audioPlayer.stop( true );
		getVoiceConnection( this.#guild.id )?.destroy();
		
		this.lockQueue( false );
		
		this.#botStatus = Status.Idle;
		console.log( `Setting status for guild '${this.#guild.name}' to idle.` );
		return;
	}//end method idle
	
	/*	Pauses and waits 2 minutes for the currently occupied voice channel to become populated. Once voice channel is joined by a user, unpauses and continues playing.
		If channel does not become occupied, skips to the next valid request and plays if one exists.
		If no valid next request exists, transitions to idle. */
	async standby() {
		await this.pausePlay();
		
		clearTimeout( this.#standbyTimerID );
		
		this.#standbyTimerID = setTimeout( async () => {
			await this.skipToNextValid();
			
			await this.play();
			
			if( this.#botStatus != Status.Playing )
				this.idle();
		}, 120000 );
		
		console.log( 'Activating standby deactivation listener' );
		globalThis.client.removeAllListeners( 'voiceStateUpdate' );
		globalThis.client.on( 'voiceStateUpdate', this.#standbyDeactivateListener );
		
		this.#botStatus = Status.Standby;
		console.log( `Setting status for guild '${this.#guild.name}' to standby.` );
		return;
	}//end method standby
	
	/*	Waits 10 minutes for a user to add something to the queue. If bot does not play before then, transitions to idle state.	*/
	wait() {
		clearTimeout( this.#standbyTimerID );
		
		this.#standbyTimerID = setTimeout( () => {
			if( this.#botStatus != Status.Playing )
				this.idle();
		}, 600000 );
		
		globalThis.client.removeAllListeners( 'voiceStateUpdate' );
		
		this.#botStatus = Status.Waiting;
		console.log( `Setting status for guild '${this.#guild.name}' to waiting.` );
		return;
	}//end method wait
	
	/* 	Begins playing the first request in the queue and set the bot status to Playing. 
		If queue is empty, does nothing.
	*/
	async play() {
		if( this.#queue.length === 0 ) {
			return;
		}//end if
		
		const request = this.#queue[0]; //The next Request object in the queue
		const requestStream = await request.getStream(); //The readable stream created from the next request
		
		clearTimeout( this.#standbyTimerID );
		
		console.log( `Joining voice channel '${request.getChannel().name}'.` );
		joinVoiceChannel( {
			channelId: request.getChannel().id,
			guildId: this.#guild.id,
			adapterCreator: this.#guild.voiceAdapterCreator,
		} );
		
		getVoiceConnection( this.#guild.id ).subscribe( this.#audioPlayer );
		
		this.#audioPlayer.play( requestStream );
		
		this.#sendNowPlaying();
		
		console.log( 'Activating standby activation listener' );
		globalThis.client.removeAllListeners( 'voiceStateUpdate' );
		globalThis.client.on( 'voiceStateUpdate', this.#standbyActivateListener );
		
		console.log( `Setting status for guild '${this.#guild.name}' to playing.` );
		this.#botStatus = Status.Playing;
		return;
	}//end method play
	
	/*	Pauses the currently playing request, if exists.
		If no requests exist, does nothing.
	*/
	async pausePlay() {
		if( this.#queue.length === 0 )
			return;
		
		console.log( 'Pausing play.' );
		
		this.#audioPlayer.pause();
		this.#queue[0].pauseResource();
		
		return;
	}//end method pause
	
	/*	Pauses the currently playing request and transitions to paused state.
		If no requests exist or the bot is not currently playing, does nothing.
	*/
	async pause() {
		if( this.#queue.length === 0 || this.#botStatus !== Status.Playing )
			return;
		
		clearTimeout( this.#standbyTimerID );
		
		await this.pausePlay();
		
		console.log( 'Activating standby activation listener' );
		globalThis.client.removeAllListeners( 'voiceStateUpdate' );
		globalThis.client.on( 'voiceStateUpdate', this.#standbyActivateListener );
		
		console.log( `Setting status for guild '${this.#guild.name}' to paused.` );
		this.#botStatus = Status.Paused;
		
		return;
	}//end method pause
	
	/*	Resumes the currently paused request, if exists, and sets the bot's status to playing.
		If no requests exist or the bot is not currently paused or on standby, does nothing.
	*/
	async resume() {
		if( this.#queue.length === 0 
			|| !(this.#botStatus === Status.Paused || this.#botStatus === Status.Standby) 
		) return;
		
		console.log( 'Resuming play.' );
		
		if( !this.#queue[0].isLiveStream() ) {
			console.log( 'Resuming standard request and unpausing.' );
			
			this.#queue[0].resumeResource();
			this.#audioPlayer.unpause();
			
			console.log( 'Activating standby activation listener' );
			globalThis.client.removeAllListeners( 'voiceStateUpdate' );
			globalThis.client.on( 'voiceStateUpdate', this.#standbyActivateListener );
			
			console.log( `Setting status for guild '${this.#guild.name}' to playing.` );
			this.#botStatus = Status.Playing;
			
			await this.#sendNowPlaying();
		}//end if
		else {
			//Need to re-resolve livestreams to catch up
			console.log( 'Re-resolving livestream request.' );
			await this.play();
		}//end if-else
		
		return;
	}//end method pause
	
	/* 	Sets the next request to be played in a populated voice channel as the first request in the queue.
		If this is not the next immediate request, all requests between that playing now and that being skipped to are discarded.
		If no such request exists, the queue is instead emptied.
	*/
	async skipToNextValid() {
		this.lockQueue( true );
		
		if( this.#queue[0] ) {
			//If a request exists in the queue to be played, shift it out.
			
			console.log(  `Shifting immediate request '${ await this.#queue[0].getTitle() }' out of the queue.` );
			this.#queue.shift();
		}//end if
		
		const botChannelId = this.#guild.me.voice?.channelId; //Snowflake ID of the voice channel occupied by the bot, or undefined if the bot is not in a vc.
		while( this.#queue[0] && (	
			( botChannelId === this.#queue[0].getChannel().id && this.#queue[0].getChannel().members.size < 2 ) ||
			( botChannelId !== this.#queue[0].getChannel().id && this.#queue[0].getChannel().members.size < 1 )
		) ) {
			//While there exists something else in the queue and it's for a channel not occupied by someone other than the bot, skip it if the channel it is to be played in is unpopulated
			console.log(  `Shifting unhearable request '${ await this.#queue[0].getTitle() }' out of the queue.` );
			this.#queue.shift();
		}//end while
		
		this.lockQueue( false );
		return;
	}//end method skipToNextValid
	
	/*	Returns a copy of the current queue.	*/
	getQueue() {
		return Array.from( this.#queue );
	}//end method getQueue
	
	/* 	Validates and adds a new request to the end of the queue. Intended to be used only when the queue is already locked by the caller.
		Throws an error if request is not of type Request.
	*/
	async pushToQueue( request ) {
		if( !(request instanceof Request) ) {
			throw new TypeError( 'Attempting to push non-QueueEntry object to the queue' );
		}//end if
		
		this.lockQueue( true );
		
		console.log( `Pushing '${request.getTitle()}' to queue.` );
		this.#queue.push( request );
		
		this.lockQueue( false );
		
		return;
	}//end method pushToQueue
	
	/*	Converts the value supplied to a boolean, and uses that to set the queue lock status to either true or false.	*/
	lockQueue( queueStatus ) {
		this.#queueLock = ( queueStatus ? true : false );
		console.log( 'Setting queue lock to ' + this.#queueLock );
		
		return;
	}//end method lockQueue
	
	/*	Determines if the queue is locked or not.	*/
	isQueueLocked() {
		return this.#queueLock
	}//end method isQueueLocked
	
	/*	Gets the bot's current status.	*/
	getStatus() {
		return this.#botStatus;
	}//end method getStatus
	
	/* Sets the home channel ID from the id of the supplied guild text channel, or sets to a false-y value if supplied instead. */
	setHomeChannel( homeChannel ) {
		if( homeChannel && !(homeChannel instanceof BaseGuildTextChannel) ) {
			throw new TypeError( 'Attempting to set non-text channel as home channel' );
		}//end if
		
		this.#homeChannelID = homeChannel?.id;
		return;
	}//end method setHomeChannelID
	
	/*	Sends the 'Now playing {Current request title}' message if the home channel is set and resolveable, and if the bot is currently playing.	*/
	async #sendNowPlaying() {
		
		if( this.#homeChannelID 
			&& this.#guild.channels.resolve(this.#homeChannelID) 
			&& this.#botStatus === Status.Playing 
		) {
			await this.#guild.channels.resolve( this.#homeChannelID ).send( await nowPlayingMessage(this.#queue[0]) );
		}//end if
		
		return;
	}//end method sendNowPlaying
	
};//end class GuildSubscription