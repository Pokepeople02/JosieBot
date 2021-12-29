const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource  } = require('@discordjs/voice');
const ytdl  = require('ytdl-core');

module.exports = {
	
	data : new SlashCommandBuilder()
		.setName( 'play' )
		.setDescription( 'Adds request to the queue and plays requests from queue in a voice channel.' )
		.addSubcommand( subcommand => subcommand
			.setName( 'a' )
			.setDescription( 'Adds request to the queue. If the bot is idle, begins playing in the requesting user\'s channel.' )
			.addStringOption( option => option
				.setName( 'request' )
				.setDescription( 'The URL of the requested video.' )
				.setRequired(true)
			)
		)
		.addSubcommand( subcommand => subcommand
			.setName( 'in' )
			.setDescription( 'Adds request to the queue and begins playing in the requested channel.' )
			.addChannelOption(option => option
				.setName('channel')
				.setDescription('The channel to join.')
				.setRequired(true)
			) 
			.addStringOption( option => option
				.setName( 'request' )
				.setDescription( 'The URL of the video requested.' )
				.setRequired(true)
			) 
		)
		.addSubcommand( subcommand => subcommand
			.setName( 'at' )
			.setDescription( 'Adds request to the queue and begins playing in the requested user\'s channel.' )
			.addUserOption( option => option
				.setName('user')
				.setDescription('The user whose voice channel to join.')
				.setRequired(true)
			)
			.addStringOption( option => option
				.setName( 'request' )
				.setDescription( 'The URL of the video requested.' )
				.setRequired(true)
			) 
		),
	
	async play( interaction ) {
		try {
			const urlPattern = /^(https\:\/\/www\.youtube\.com\/watch\?v\=(.){11}){1}$/; //RegEx used to match YouTube video URLs.
			const reqStr = interaction.options.getString( 'request' ); //Input command string option for requested song.
			const audioPlayer = createAudioPlayer(); //Holds AudioPlayer of a given guild.
			let voiceConnection; //Holds current VoiceConnection of the bot for a given guild.
			
			console.log( `Request: '${reqStr}'` );
			
			//TEMP: Validate request is a valid youtube video URL
			//Only needed until I implement youtube search queries
			if( !urlPattern.test(reqStr) ) {
				await interaction.reply( 'Support for formats other than full direct YouTube video URLs is not yet implemented.' );
				console.log( 'Requested failed: Invalid format.' );
				return;
			}//end if
			
			const reqResource = createAudioResource( ytdl(reqStr) ); //Holds audio resource created from the input request.
			
			switch( interaction.options.getSubcommand() ) {
				case 'a' :
					await interaction.reply( 'Unfinished or unimplemented command!' );
					console.log( 'Requested failed: Unimplemented command.' );
					
					break;
				case 'in' :
					const channel = interaction.options.getChannel('channel', true);
					
					//TODO: Add request to queue
					
					//Disregard command if requested non-voice channel
					if( !channel.isVoice() ) { 
						await interaction.reply(`Unable to join channel: #${channel.name} is not a voice channel.`);
						break;
					}//end if
					
					//Join specified voice channel
					voiceConnection = joinVoiceChannel(
						{	channelId: channel.id,
							guildId: channel.guildId,
							adapterCreator: channel.guild.voiceAdapterCreator
						}//end object
					);
					voiceConnection.subscribe( audioPlayer );
					audioPlayer.play( reqResource );
					
					await interaction.reply( 'Success! Playing request.' );
					
					break;
				case 'at' :
					await interaction.reply( 'Unfinished or unimplemented command!' );
					console.log( 'Requested failed: Unimplemented command.' );
					
					break;
				default:
					console.log( `Request failed: Unknown subcommand: ${subcom}` );
					await interaction.reply( `Unable to process request: Unknown subcommand: ${subcom}` );
			}//end switch
			
		} catch( error ) {

			await interaction.reply( 'An error occurred while executing this command.' );
			console.log( 'Unknown error occurred:' );
			console.log(error);
			
		}//end try-catch
		
	}//end function execute
};


