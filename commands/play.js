'use strict';

import { SlashCommandBuilder } 	from '@discordjs/builders';

import { Status } 				from '../bot-status.js';
import { Request } 				from '../request.js';
import {
	queueLockedReply,
	requesterNotInVoiceReply,
	playInNonVoiceReply,
	userNotInVoiceReply,
	unknownCommandErrorReply,
	requestInvalidReply,
	noResultsReply,
	playSuccessReply,
} 								from '../messages.js';

/* JSON data for /play subcommands, built with discord.js' SlashCommandBuilder. */
export const data = new SlashCommandBuilder()
	.setName( 'play' )
	.setDescription( 'Adds request to the queue and plays requests from queue in a voice channel.' )
	.addSubcommand( subcommand => subcommand
		.setName( 'a' )
		.setDescription( 'Adds request to the queue. If the bot is idle, begins playing in the requesting user\'s channel.' )
		.addStringOption( option => option
			.setName( 'request' )
			.setDescription( 'The URL of the requested video.' )
			.setRequired( true )
		)
	)
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
	
/* Determines a request from the supplied interaction and adds it to the queue of the supplied guild subscription. */
export async function play( interaction, guildSub ) {
	if( guildSub.isQueueLocked() ) {
		//If queue is locked, request fails.
		
		console.log( 'Command failed: Queue locked.' );
		await interaction.editReply( queueLockedReply() );
		return;
	}//end if
	
	const subcommand = interaction.options.getSubcommand(); //String representation of subcommand requested.
	let channel; //Channel object for the requested voice channel to join.
	
	switch( subcommand ) { //Get appropriate channel for request
		case 'a' : //'play a {request}' subcommand
			if( interaction.member.voice.channel ) channel = interaction.member.voice.channel;
			else channel = undefined;
			
			if( !channel ) {
				console.log( 'Channel parsing failed: Requesting user not in voice channel.' );
				await interaction.editReply( requesterNotInVoiceReply() );
				return;
			}//end if
			
			break;
		case 'in' : //'play in {channel} {request}' subcommand
			channel = interaction.options.getChannel('channel', true);
			
			if( !channel.isVoice() ) {
				console.log( 'Channel parsing failed: Channel requested is non-voice channel.' );
				await interaction.editReply( playInNonVoiceReply(channel) );
				return;
			}//end if
			
			break;
		case 'at' : //'play at {user} {request}' subcommand
			const guildMember = interaction.guild.members.resolve( interaction.options.getUser('user', true) ); //The supplied user as a member of this guild
	
			if( !guildMember ) channel = undefined;
			else channel = guildMember.voice.channel;
			
			if( !channel ) {
				console.log( 'Channel parsing failed: Requested user not in voice channel.' );
				await interaction.editReply( userNotInVoiceReply(interaction.options.getUser('user', true)) );
				return;
			}//end if
			
			break;
		default:			
			console.log( `Subcommand parsing failed: Unknown subcommand '${subcommand}'` );
			await interaction.editReply( unknownCommandErrorReply('play ' + subcommand) );
			
			return;
	}//end switch
	
	//Parse request string
	let requestString = interaction.options.getString( 'request', true ); //String representation of user request.
	
	if( requestString.includes( 'youtube.com') && requestString.includes('&') ) {
		//Special case: If request string is a youtube url with a playlist modifier, strip the playlist modifier
		requestString = requestString.substring( 0, requestString.indexOf('&') );
	}//end if
	
	let request = new Request( requestString, channel, interaction.member ); //Request object created from user request
	await request.init();
	
	if( !request.isValid() ) {
		
		if( request.getResultCount() === 0 ) {
			console.log( 'Request creation failed: no results found for request.' );
			await interaction.editReply( noResultsReply() );
		}//end if
		else {
			//Generic request invalid error
			console.log( 'Request creation failed: request is invalid.' );
			await interaction.editReply( requestInvalidReply() );
		}//end if-else
		
		return;
	}//end if
	
	guildSub.pushToQueue( request );
	await interaction.editReply( await playSuccessReply(request) );
	
	if( !(guildSub.getStatus() === Status.Playing || guildSub.getStatus() === Status.Standby) ) {
		//If not already playing or on standby, begin playing.
		guildSub.play();
	}//end if
	
	return;
}//end function play