'use strict';

const { 
	AudioPlayerStatus,
	VoiceConnectionStatus,
	createAudioPlayer,
	getVoiceConnection,  
	joinVoiceChannel,
} = require ( '@discordjs/voice' );

const { QueueEntry } 	= require( './queue-entry.js' );
const { Status } 		= require( './bot-status.js' );

/*	Keeps track of guild-specific information for an instance of the bot, including a queue and the bot's current state.	*/
module.exports.GuildSubscription = class GuildSubscription {
	
	#guild;						//Guild object to which this subscription belongs.
	#botStatus = Status.Idle; 	//The current status of the bot for the subscription's guild.
	#audioPlayer; 				//Audio player attached to the voice connection of the subscription's guild.
	#queue = [];				//Queue of Resource objects corresponding to requests made in the subscription's guild.
	#queueLock = false;			//Flag to indicate whether the queue is locked for modification.
	#standbyTimerID = -1;		//ID of the current standby or waiting timer for the bot.
	#homeChannelID = null;		//Snowflake ID of the home channel in which the bot announces newly playing tracks.
	
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
		this.#audioPlayer.stop( true );
		getVoiceConnection( this.#guild.id )?.destroy();
		
		this.lockQueue( false );
		
		this.#botStatus = Status.Idle;
		console.log( `Setting status for guild '${this.#guild.name}' to idle.` );
		return;
	}//end method idle
	
	/*	Currently waits 10 minutes for a user to play something before transitioning to idle status.	*/
	standby() {
		this.#standbyTimerID = setTimeout( () => {
			this.idle();
		}, 600000 );
		
		this.#botStatus = Status.Standby;
		console.log( `Setting status for guild '${this.#guild.name}' to standby.` );
		return;
	}//end method standby
	
	/*	Currently waits 10 minutes for a user to play something before transitioning to idle status.	*/
	wait() {
		this.#standbyTimerID = setTimeout( () => {
			this.idle();
		}, 600000 );
		
		this.#botStatus = Status.Waiting;
		console.log( `Setting status for guild '${this.#guild.name}' to waiting.` );
	}//end method wait
	
	/* 	Begins playing the first request in the queue and set the bot status to Playing. 
		If queue is empty, does nothing.
	*/
	async play() {
		if( this.#queue.length === 0 ) {
			return;
		}//end if
		
		const request = this.#queue[0]; //The next QueueEntry object in the queue
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
		
		console.log( `Setting status for guild '${this.#guild.name}' to playing.` );
		this.#botStatus = Status.Playing;
		
		return;
	}//end method play
	
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
		
		while( this.#queue[0] && (this.#queue[0].getChannel().id !== this.#guild.me.voice?.channelId) && (this.#queue[0].getChannel().members.size < 1) ) {
			//While a request still exists for a different channel, skip it if the channel it is to be played in is unpopulated.
			
			console.log(  `Shifting unheardable request '${ await this.#queue[0].getTitle() }' out of the queue.` );
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
		Throws an error if request is not of type QueueEntry.
	*/
	async pushToQueue( request ) {
		if( !(request instanceof QueueEntry) ) {
			throw new TypeError( 'Attempting to push non-QueueEntry object to the queue' );
		}//end if
		
		this.lockQueue( true );
		
		console.log( `Pushing '${ await request.getTitle() }' to queue.` );
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
	
};//end class GuildSubscription