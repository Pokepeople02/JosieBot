'use strict';

const { createAudioResource } = require( '@discordjs/voice' );
const play = require( 'play-dl' );

/* 	Represents a single request made to be stored in a guild subscription's queue.	*/
module.exports.QueueEntry = class QueueEntry {

	#str; 		//String used to construct the request
	#type;		//String denoting the type of request
	#info;		//Play-dl info about a request
	#channel;	//The guild voice channel the request is to be played in
	
	/*	Creates a new request from the specified request string to be played in the supplied channel.
		Throws an error if the request string cannot be resolved to a valid request.
	*/
	constructor( requestStr, channel ) {
		console.log( 'Creating new request entry.' );
		
		this.#str = requestStr;
		this.#channel = channel;
		this.#type = undefined;
		this.#info = undefined;
		
		return;
	}//end constructor
	
	/*	Initializes the request by setting the type and the info for it. Needs to be invoked manually.	*/
	async init() {
		console.log( 'Initializing request.' );
		
		//Set type
		try {
			this.#type = await play.validate( this.#str );
		} catch { this.#type = false; };
		console.log( 'Request type: ' + this.#type );
		
		//Set info
		switch( await this.#type ) {
			case 'search' :
				let results = await play.search( this.#str, {
						limit: 1,
				} );
				
				this.#info = await play.video_info( results[0].url );
				
				break;
			case 'yt_video':
				this.#info = await play.video_info( this.#str );
				
				break;
			default :
				this.#info = undefined;
				return;
		}//end switch
		console.log( 'Request info gotten. Title: ' + this.getTitle() );
		
		return;
	}//end method init
	
	/*	Creates and returns a usable discord.js audio resource for this request.	*/
	async getStream() {
		let streamResource; 						//The returned play-dl stream object.
		let audioResource;							//The usable audio resource created from the constructed stream
		const streamOptions = {						//The stream options given to play-dl
			discordPlayerCompatibility: true,
		};
		
		console.log( `Resolving request '${this.getTitle()}'` );
		
		console.log( 'Constructing stream.' );
		streamResource = await play.stream_from_info( this.#info, streamOptions );
		
		console.log( 'Creating audio resource from stream.' );
		audioResource = createAudioResource( streamResource.stream, {
			inputType: streamResource.type
		} );
		
		return audioResource;
	}//end method getStream
	
	/*	Returns the title associated with this request.	*/
	getTitle() {
		return this.#info.video_details.title;
	}//end method getTitle
	
	/*	Returns the type of this request.	*/
	getType() {
		return this.#type;
	}//end method getType
	
	/*	Returns true if this request is both valid and of a supported type. Otherwise, returns false.	*/
	isValid() {
		if( this.#type && (this.#type === 'search' || this.#type === 'yt_video') ) return true;
		return false;
	}//end method isValid
	
	/*	Returns the channel object stored by this request.	*/
	getChannel() {
		return this.#channel;
	}//end method getChannel
	
}//end class QueueEntry