const { SlashCommandBuilder } = require( '@discordjs/builders' );
const { GuildSubscription } = require( '../guild-subscription.js' );
const { QueueEntry, EntryType } = require( '../queue-entry.js' );

module.exports.data = new SlashCommandBuilder()
	.setName( 'play' )
	.setDescription( 'Adds request to the queue and plays requests from queue in a voice channel.' )
	/*
	.addSubcommand( subcommand => subcommand
		.setName( 'a' )
		.setDescription( 'Adds request to the queue. If the bot is idle, begins playing in the requesting user\'s channel.' )
		.addStringOption( option => option
			.setName( 'request' )
			.setDescription( 'The URL of the requested video.' )
			.setRequired(true)
		)
	)
	*/
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
	)
	/*
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
	);
	*/
	
module.exports.play = async function play( interaction ) {
	const guildSub = globalThis.subMap.get( interaction.guildId ); //GuildSubscription object for current guild.
	const requestString = interaction.options.getString( 'request' ); //request string option from input command.
	
	//If queue is locked, request fails.
	if( guildSub.queueLock ) {
		console.log( 'Request failed: Queue locked.' );
		await interaction.editReply( `Unable to process request: The queue is currently locked.` );
		return;
	}//end if
	
	console.log( 'Locking queue.' );
	guildSub.queueLock = true; //Lock queue
	
	//Determine appropriate channel to join, depending on subcommand
	let channel; //Channel object for the requested voice channel to join.
	const subcom = interaction.options.getSubcommand(); //String representation of subcommand requested.
	switch( subcom ) {
		/*
		case 'a' : //'play a request' subcommand
			await interaction.editReply( { 
				content: 'Unfinished or unimplemented command!',
				ephemeral: true,
			} );
			console.log( 'Requested failed: Unimplemented command.' );
			
			break;
		*/
		case 'in' : //'play in channel' subcommand
			channel = interaction.options.getChannel('channel', true);
			break;
		/*
		case 'at' : //'play at user' subcommand
			await interaction.editReply( 'Unfinished or unimplemented command!' );
			console.log( 'Requested failed: Unimplemented command.' );
			
			break;
		*/
		default:			
			console.log( `Request failed: Unknown subcommand: ${subcom}` );
			await interaction.editReply( `Unable to process request: Unknown subcommand '${subcom}'` );
			
			console.log( 'Unlocking the queue.' );
			guildSub.queueLock = false;
			
			return;
	}//end switch
	
	//Validate voice channel
	if( !channel || !channel.isVoice() || !interaction.guild.channels.resolve(channel) ) {
		//Disregard command if requested non-voice channel
		console.log( 'Play command failed: Request for invalid or non-voice channel.' );
		
		await interaction.editReply( {
			content: `Unable to process request: '${channel?.name}' is not a voice channel in this guild.`,
			ephemeral: true,
		} );
		
		console.log( 'Unlocking the queue.' );
		guildSub.queueLock = false;
		
		return;
	}//end if
	
	//Add new resource to the queue
	try {
		const request = new QueueEntry( requestString, EntryType.YoutubeVideo, channel ); //QueueEntry object created from the processed play request.
		
		guildSub.queue.push( request );
		console.log( 'Pushing request to guild queue. ' );
		
		//Notify user that request was queued.
		await interaction.editReply( `Adding "${(await request.info).videoDetails.title}" to the queue.` );
	} catch(error) {
		console.log( 'Error during request creation: ' );
		console.log( error );
		
		await interaction.editReply( {
			content: `Unable to add request to the queue. Please try a different request.`,
			ephemeral: true,
		} );
	}//end try-catch
	
	console.log( 'Unlocking the queue.' );
	guildSub.queueLock = false;
		
	//If not currently playing, begin playing.
	if( guildSub.botStatus != 'playing' )
		await guildSub.updateStatus( 'playing' );
		
}//end function play


