const { createAudioResource } = require( '@discordjs/voice' );
const ytdl = require('ytdl-core');

module.exports.QueueEntry = class QueueEntry {

	constructor( request, type, channel ) {
		console.log( 'Creating new request entry.' );
		
		this.info = getVideoInfo( request ); //ytdl metainfo of the requested resource
		this.type = type; //The type of the requested resource.
		this.channel = channel; //The channel this request is to be played in.
	}//end constructor
	
	async resolve() {
		console.log( 'Resolving request into usable stream.' );
		
		switch( this.type ) {
			
			case module.exports.EntryType.YoutubeVideo :
				return createAudioResource( 
					ytdl.downloadFromInfo( await this.info, { 
						filter: 'audioonly', 
						quality: 'highestaudio',
						dlChunkSize: 0,
						highWatermark: 1 << 23,
					})
				);
				break;
			default :
				throw 'Unknown resource type';
		}//end switch
		
	}//end method resolve
	
};

function getVideoInfo( request ) {
	
	if( ytdl.validateURL(request) ) {
		return ytdl.getInfo(request);
	} else {
		throw 'Unable to parse valid Youtube video ID';
	}//end if-else
		
}//end function getVideoInfo

module.exports.EntryType = class EntryType {
	static YoutubeQuery = 		Symbol("YoutubeSearchQuery");
	static YoutubeVideo = 		Symbol("YoutubeURL");
	static YoutubePlaylist = 	Symbol("YoutubePlaylist");
	static TwitchVOD =			Symbol("TwitchVOD");
	static SoundcloudTrack =	Symbol("SoundcloudTrack");
	static RawAudio =			Symbol("RawAudio");
};