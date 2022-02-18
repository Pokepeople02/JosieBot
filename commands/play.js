'use strict';

const { SlashCommandBuilder } 	= require( '@discordjs/builders' );

const { Status } 				= require( '../bot-status.js' );
const { QueueEntry } 			= require( '../queue-entry.js' );

/* JSON data for /play subcommands, built with discord.js' SlashCommandBuilder. */
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
			.setRequired( true )
		)
	)
	*/
	.addSubcommand( subcommand => subcommand
		.setName( 'in' )
		.setDescription( 'Adds request to the queue to be played in the requested channel.' )
		.addChannelOption(option => option
			.setName( 'channel' )
			.setDescription( 'The channel to join.' )
			.setRequired( true )
		) 
		.addStringOption( option => option
			.setName( 'request' )
			.setDescription( 'The URL of the video requested.' )
			.setRequired( true )
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
	
/* Determines a request from the supplied interaction and adds it to the queue of the supplied guild subscription. */
module.exports.play = async function play( interaction, guildSub ) {
	if( guildSub.isQueueLocked() ) {
		//If queue is locked, request fails.
		
		console.log( 'Command failed: Queue locked.' );
		await interaction.editReply( 'Unable to process request: The queue is currently being modified. Please try again in a moment.' );
		
		return;
	}//end if
	
	const subcommand = interaction.options.getSubcommand(); //String representation of subcommand requested.
	let channel; //Channel object for the requested voice channel to join.
	
	switch( subcommand ) {
		//Get appropriate channel for request
		
		case 'a' : //'play a {request}' subcommand
			//TODO: Unimplemented
			break;
		case 'in' : //'play in {channel} {request}' subcommand
			channel = getChannelPlayIn( interaction );
			break;
		case 'at' : //'play at {user} {request}' subcommand
			//TODO: Unimplemented
			break;
		default:			
			console.log( `Subcommand parsing failed: Unknown subcommand '${subcommand}'` );
			await interaction.editReply( `Unable to process request: Unknown subcommand '${subcommand}'` );
			
			return;
	}//end switch
	
	if( !channel || !channel.isVoice() || !interaction.guild.channels.resolve(channel) ) {
		//Disregard if requested nonexistant or non-voice channel
		
		if( !channel) {
			console.log( 'Channel parsing failed: Channel is null or undefined.' );
			await interaction.editReply( {
				content: 'Unable to process request: The channel requested does not exist.',
				ephemeral: true,
			} );
		} else {
			console.log( 'Channel parsing failed: Channel requested is foreign or non-voice.' );
			await interaction.editReply( {
				content: `Unable to process request: '${channel?.name}' is not a voice channel in this guild.`,
				ephemeral: true,
			} );
		}//end if-else
		
		return;
	}//end if
	
	//Parse request string
	let requestString; //String representation of user request.
	try {
		requestString = interaction.options.getString( 'request', true );
	} catch {
		console.log( 'Request parsing failed: No request given.' );
		await interaction.editReply( {
			content: `Unable to process request: Please supply a request.`,
			ephemeral: true,
		} );
		
		return;
	}//end try-catch
	
	if( requestString.includes( 'youtube.com') && requestString.includes('&') ) {
		//Special case: If request string is a youtube url with a playlist modifier, strip the playlist modifier
		requestString = requestString.substring( 0, requestString.indexOf('&') );
	}//end if
	
	let request = new QueueEntry( requestString, channel ); //QueueEntry object created from user request
	await request.init();
	
	if( !request.isValid() ) {
		
		console.log( 'Request creation failed: request is invalid or unavailable.' );
		await interaction.editReply( {
			content: `Unable to process this request. Please try a different request.`,
			ephemeral: true,
		} );
		
		return;
	}//end if
	
	guildSub.pushToQueue( request );
	await interaction.editReply( `Added "${request.getTitle()}" to the queue for channel '${channel.name}'.` );
	
	if( !(guildSub.getStatus() === Status.Playing || guildSub.getStatus() === Status.Standby) ) {
		//If not already playing or on standby, begin playing.
		
		guildSub.play();
	}//end if
	
	return;
}//end function play

/* Takes 'play in' command interaction, returns channel requested or null if no channel was supplied. */
function getChannelPlayIn( interaction ) {
	
	try {
		return interaction.options.getChannel('channel', true);
	} catch {
		return null;
	}//end try-catch
	
}//end function getChannelPlayIn