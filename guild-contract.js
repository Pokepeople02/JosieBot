const { joinVoiceChannel, createAudioPlayer, getVoiceConnection, AudioPlayerStatus, createAudioResource } = require('@discordjs/voice');
const ytdl  = require('ytdl-core');

module.exports = {
	GuildContract: function(guild) {
		this.guild = guild; //Holds the Guild object of the given guild.
		this.audioPlayer = createAudioPlayer(); //Holds AudioPlayer of a given guild.
		this.queue = []; //Holds queue of objects corresponding to requests made in a given guild. Entries take the form of { resource: string, type: string }.
		this.status = 'idle'; //Holds the current status of the bot for a given guild.
//		this.standbyTimer = null; //Holds the standby timer of the bot. Upon entering standby mode, 10 minute timer begins until bot enters idle mode. Halted and reset upon play.
		
		/* Sets the status of a guild's bot.
		 * Potential values for status are:
		 *	'idle' :		Bot is not in use. Upon idle, the queue is emptied, play ends, and the bot disconnects from the connected voice channel.
		 *	'playing' :		The bot is currently in use, and begins playing. The first resource in the queue is popped, and playback begins.
		 *	'standby' :		The bot has been in recent use, and has not yet entered idle. Play will not continue past the current request, and idle will be entered after 10 minutes.
		 */
		this.updateStatus = function(newStatus) {
			
			switch(newStatus) {
				case 'idle' :
					this.status = 'idle';
					console.log( `\nSetting status for guild '${this.guild.name}' to idle.` );
					
					this.audioPlayer.pause(); //Pauses current audio
					console.log( 'Paused audio player.' );
					
					this.queue = []; //Clear queue
					console.log( 'Cleared queue.' );
					
					clearTimeout( this.standbyTimer ); //Clear standby timer


					getVoiceConnection( this.guild.id )?.destroy(); //Disconnect from audio connection
					console.log( 'Destroyed audio connection and disconnected from voice channel.' );
					
					break;
				case 'playing' :
					this.status = 'playing';
					console.log( `Setting status for guild '${this.guild.name}' to playing.` );
					
					clearTimeout( this.standbyTimer ); //Clear standby timer
					let rawResource = this.queue.pop(); //Pop next resource
					let audioResource;
					
					if( rawResource ) { //Play next resource, if one exists
						getVoiceConnection( this.guild.id ).subscribe( this.audioPlayer );
						console.log( 'Subscribed audio connection to player, playing next resource from queue.' );
						
						//Resolve resource
						audioResource = resolveResource( rawResource.resource, rawResource.type ); 
						
						this.audioPlayer.play( audioResource );
						this.audioPlayer.once( AudioPlayerStatus.Idle, () => {
								console.log( 'Current resource has concluded.' );
							
								if( this.queue.size == 0 || this.guild.me.voice.channel.members.size <= 1 )
									this.updateStatus( 'standby' );
								else
									this.updateStatus( 'playing' );
							}//end function
						);
						
					} else { //If not, failsafe to standby.
						this.updateStatus( 'standby' );
					}//end if
					
					break;
				case 'standby' :
					this.status = 'standby';
					console.log( `Setting status for guild '${this.guild.name}' to standby.` );
					
					this.queue = []; //Clear queue
					console.log( 'Cleared queue.' );
					
					//Set up standby timer
					this.standbyTimer = setTimeout( 
					() => {
						this.updateStatus( 'idle' );
					}, 600000 );
					
					break;
				default :
					throw ( 'Error: Invalid status update: ' + newStatus );
			}//end switch
			
		}; //end method setStatus
		
//		this.addToQueue = function() {
//			
//		};//end method addToQueue
		
	}//end object GuildContract
};

function resolveResource( resourceURL, resourceType ) {
	let audioResource;
	
	switch( resourceType ) {
		case 'youtube_url' :
			return createAudioResource( ytdl( resourceURL ) );
			break;
		default:
			throw 'Invalid resource type: ' + resourceType;
	}//end switch
	
	return audioResource;
}//end function resolveResource