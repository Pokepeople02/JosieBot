const { SlashCommandBuilder } = require( '@discordjs/builders' );
const { joinVoiceChannel, createAudioResource, getVoiceConnection } = require( '@discordjs/voice' );
const { GuildSubscription } = require( '../guild-subscription.js' );
const { QueueEntry } = require( '../queue-entry.js' );

module.exports.data = new SlashCommandBuilder()
	.setName( 'play' )
	.setDescription( 'Adds request to the queue and plays requests from queue in a voice channel.' )
	/*.addSubcommand( subcommand => subcommand
		.setName( 'a' )
		.setDescription( 'Adds request to the queue. If the bot is idle, begins playing in the requesting user\'s channel.' )
		.addStringOption( option => option
			.setName( 'request' )
			.setDescription( 'The URL of the requested video.' )
			.setRequired(true)
		)
	)*/
	.addSubcommand( subcommand => subcommand
		.setName( 'in' )
		.setDescription( 'Adds request to the queue to be played in the requested channel.' )
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
	)/*
	.addSubcommand( subcommand => subcommand
		.setName( 'at' )
		.setDescription( 'Adds request to the queue to be played in the requested user\'s channel.' )
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
	);*/
	
module.exports.play = async function play( interaction ) {
	const reqStr = interaction.options.getString( 'request' ); //Request string
	const guildSub = globalThis.subMap.get( interaction.guildId ); //GuildSubscription object for current guild.
	let reqChannel; //Channel object for the requested voice channel to join.
	let reqQueueEntry; //QueueEntry object created from play request.
	
	//TEMP: Validate request is a valid youtube video URL
	//Only needed until I implement youtube search queries
//	if( !urlPattern.test(reqStr) ) {
//		await interaction.reply( {
//				content: 'Support for formats other than full YouTube video URLs is not yet implemented.',
//				ephemeral: true,
//		} );
//		console.log( 'Requested failed: Invalid format.' );
//		return;
//	}//end if
	
	//Determine appropriate channel to join, depending on subcommand
	const subcom = interaction.options.getSubcommand();
	switch( subcom ) {
		case 'a' : //'play a request' subcommand
			await interaction.reply( { 
				content: 'Unfinished or unimplemented command!',
				ephemeral: true,
			} );
			console.log( 'Requested failed: Unimplemented command.' );
			
			break;
		case 'in' : //'play in channel' subcommand
			//Get requested channel to join.
			reqChannel = interaction.options.getChannel('channel', true);
			
			//Disregard command if requested non-voice channel
			if( !reqChannel.isVoice() ) { 
				console.log( 'Request failed: Attempt to join non-voice channel.' );
				await interaction.reply( {
					content: `Unable to join channel: #${channel.name} is not a voice channel.`,
					ephemeral: true,
				} );
				break;
			}//end if
			
			break;
		case 'at' : //'play at user' subcommand
			await interaction.reply( 'Unfinished or unimplemented command!' );
			console.log( 'Requested failed: Unimplemented command.' );
			
			break;
		default:
			console.log( `Request failed: Unknown subcommand: ${subcom}` );
			await interaction.reply( `Unable to process request: Unknown 'play' subcommand: ${subcom}` );
	}//end switch
		
	//Join specified voice channel
	if( !interaction.guild.me.voice?.channel != reqChannel ) {
		joinVoiceChannel( {	
			channelId: reqChannel.id,
			guildId: reqChannel.guildId,
			adapterCreator: reqChannel.guild.voiceAdapterCreator
		} );
	}//end if
	
	//Add new resource to the queue
	reqQueueEntry = new QueueEntry( reqStr, 'youtube_url' );
	guildSub.queue.push( reqQueueEntry );
	console.log( 'Pushing request to guild queue. ' );
	
	//If not currently playing, begin playing.
	if( guildSub.botStatus != 'playing' )
		guildSub.updateStatus( 'playing' );
	
	//Notify user that request was queued.
	await interaction.reply( 'Request has been added to the queue.' );
}//end function play


