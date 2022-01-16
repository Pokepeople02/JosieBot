const { createAudioResource } = require( '@discordjs/voice' );
const ytdl = require('ytdl-core');

module.exports.QueueEntry = class QueueEntry {

	constructor( request, type ) {
		this.requestInfo = request; //ytdl metainfo of the requested resource
		this.type = type; //The type of the requested resource.
		this.title = ""; //The resolved title of the requested resource
	}//end constructor
	
	resolve() {
		
		switch( this.type ) {
			case 'youtube_url' :
				return createAudioResource( 
					ytdl( this.requestInfo, { 
						filter: 'audioonly', 
						quality: 'highestaudio',
						dlChunkSize: 0,
						highWatermark: 1 << 23,
					} )
				);
				break;
			default :
				throw 'Unknown resource type';
		}//end switch
		
	}//end method resolve
};

module.exports.EntryType = class EntryType {
	static YoutubeQuery = 		Symbol("YoutubeSearchQuery");
	static YoutubeVideo = 		Symbol("YoutubeURL");
	static YoutubePlaylist = 	Symbol("YoutubePlaylist");
	static TwitchVOD =			Symbol("TwitchVOD");
	static SoundcloudTrack =	Symbol("SoundcloudTrack");
	static RawAudio =			Symbol("RawAudio");
};