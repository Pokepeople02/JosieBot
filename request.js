'use strict';

import { createAudioResource } from '@discordjs/voice';
import play from 'play-dl';

/** Represents a single request made to be stored in a guild subscription's queue. */
export class Request {

	/** String used to construct the request. */
	#str;
	/** String denoting the type of request. */
	#type;
	/** The Play-dl info about a request. */
	#info;
	/** The guild voice channel the request is to be played in. */
	#channel;
	/** The number of results returned for search requests. Otherwise, set to 1. */
	#numResults;
	/** The guild member who made this request */
	#user;
	/** The raw Play-dl stream resource of the resolved request. */
	#rawStream;
	
	/** Creates a new request from the specified request string to be played in the supplied channel.
	 * Throws an error if the request string cannot be resolved to a valid request. */
	constructor( requestStr, channel, user ) {
		console.log( 'Creating new request entry.' );
		
		this.#str = requestStr;
		this.#channel = channel;
		this.#user = user;
		this.#type = undefined;
		this.#info = undefined;
		this.#numResults = undefined;
		this.#rawStream = undefined;
		
		return;
	}//end constructor
	
	/** Initializes the request by setting the type and the info for it. Needs to be invoked manually. */
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
				this.#numResults = results.length;

				if( results.length === 0 ) {
					//Returned no or invalid results
					this.#type = false;
					console.log( 'Found no results for request' );
					return;
				}//end if
				
				this.#info = await play.video_info( results[0].url );
				
				break;
			case 'yt_video':
				this.#info = await play.video_info( this.#str );
				this.#numResults = 1;
				
				break;
			default :
				this.#info = undefined;
				return;
		}//end switch
		console.log( 'Request info gotten. Title: ' + this.getTitle() );
		
		return;
	}//end method init
	
	/** Creates and returns a usable discord.js audio resource for this request. */
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
		
		this.#rawStream = streamResource;
		
		return audioResource;
	}//end method getStream
	
	/** Pauses the currently playing raw audio stream to save resources, if possible. */
	pauseResource() {
		if( !this.#rawStream || this.isLiveStream() )
			return;
		
		this.#rawStream.pause();
		return;
	}//end method pauseResource
	
	/** Resumes the currently playing raw audio stream, if possible. */
	resumeResource() {
		if( !this.#rawStream || this.isLiveStream() )
			return;
		
		this.#rawStream.resume();
		return;
	}//end method resumeResource
	
	/** Returns the title associated with this request. */
	getTitle() {
		return this.#info.video_details.title;
	}//end method getTitle
	
	/** Returns the type of this request. */
	getType() {
		return this.#type;
	}//end method getType
	
	/** Returns true if this request is both valid and of a supported type. Otherwise, returns false.
	 * Also returns false in the case that the request is an upcoming video that is not yet live. */
	isValid() {
		if ( this.#type && ( this.#type === 'search' || this.#type === 'yt_video' ) && !this.#info.video_details.upcoming ) return true;
		return false;
	}//end method isValid
	
	/** Returns true if this request is a currently broadcasting livestream. If not, returns false. */
	isLiveStream() {
		return this.#info.video_details.live;
	}//end method isLiveStream
	
	/** Returns the channel object stored by this request. */
	getChannel() {
		return this.#channel;
	}//end method getChannel
	
	/** Returns the URL of this request. */
	getURL() {
		return this.#info.video_details.url;
	}//end method getURL
	
	/** Returns the number of results returned for a search request. Should be 0 only if no results returned. */
	getResultCount() {
		return this.#numResults;
	}//end method getResultCount
	
	/** Returns the guild member object who made this request. */
	getUser() {
		return this.#user;
	}//end method getUser
	
	/** Returns the URL for the first thumbnail of this request. */
	getThumbnailURL() {
		return this.#info.video_details.thumbnails[0]?.url;
	}//end method getThumbnailURL
	
	/** Returns the name of the user that uploaded this request. */
	getCreatorName() {
		return this.#info.video_details.channel.name;
	}//end method getCreatorName
	
	/** Returns the duration of the request in hh:mm:ss format. */
	getLength() {
		return this.#info.video_details.durationRaw;
	}//end method getLength
	
}//end class QueueEntry