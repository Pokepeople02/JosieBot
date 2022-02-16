'use strict';

const { createAudioResource } = require( '@discordjs/voice' );
const ytdl = require('ytdl-core');

/* 	Represents a single request made to be stored in a guild subscription's queue.	*/
module.exports.QueueEntry = class QueueEntry {

	#requestStr; 	//String used to construct the request
	#ytdlInfo;		//YTDL metadata about a YouTube request
	#channel;		//The channel the request is to be played in
	
	/*	Creates a new request from the specified request string to be played in the supplied channel.
		Throws an error if the request string cannot be resolved to a valid request.
	*/
	constructor( requestStr, channel ) {
		console.log( 'Creating new request entry.' );
		
		this.#requestStr = requestStr;
		this.#channel = channel;
		
		console.log( 'Setting YTDL details for request.' );
		if( ytdl.validateURL( this.#requestStr ) ) {
			//If a valid YouTube video URL, set info. 
			this.#ytdlInfo = ytdl.getInfo( this.#requestStr );
		} else {
			//Otherwise, throw an error if unable to parse a valid URL from request.
			throw new Error ( 'Unable to parse valid Youtube video ID' );
		}//end if-else
	}//end constructor
	
	/*	Creates and returns a readable stream for this request.	*/
	async getStream() {
		let rStream; //The constructed readable stream object.
		
		console.log( `Resolving request '${await this.getTitle()}' into a readable stream.` );
		
		rStream = createAudioResource( ytdl.downloadFromInfo( await this.#ytdlInfo, { 
			filter: 'audioonly', 
			quality: 'highestaudio',
			dlChunkSize: 0,
			highWatermark: 1<<25,
		} ) );
		
		return rStream;
	}//end method resolve
	
	/*	Returns the title associated with this request.	*/
	async getTitle() {
		return (await this.#ytdlInfo).videoDetails.title;
	}//end method getTitle
	
	/*	Returns the channel object stored by this request.	*/
	getChannel() {
		return this.#channel;
	}//end method getChannel
	
}//end class QueueEntry