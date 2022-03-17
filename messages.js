'use strict';

import { MessageEmbed } from 'discord.js';
import stringWidth from 'string-width';

/* Generates the reply message content for an 'unknown command input' error message. */
export function unknownCommandErrorReply( commandStr ) {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Command Failed' );
	msgEmbed.setDescription( `"${commandStr}" is not a recognized command.` );

	return {
		embeds: [msgEmbed],
		ephemeral: true,
	};
}//end function unknownCommandErrorReply

/* Generates the reply message content for an 'unknown error during execution' error message. */
export function execErrorReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Command Failed' );
	msgEmbed.setDescription( 'There was an error while executing this command!' );
	
	return {
		embeds: [msgEmbed],
		ephemeral: true,
	};
}//end function execErrorReply

/* Generates the reply message content for a 'queue locked for modification' error message. */
export function queueLockedReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Unable to Process Request' );
	msgEmbed.setDescription( 'The queue is currently being modified. Please try again later.' );
	
	return {
		embeds: [msgEmbed],
		ephemeral: true,
	};
}//end function queueLockedReply

/* Generates the reply message content for a 'requester is not in voice channel' error message. */
export function requesterNotInVoiceReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Unable to Process Request' );
	msgEmbed.setDescription( 'You need to be in a voice channel to make requests with `/play a {request}`.' );
	
	return {
		embeds: [msgEmbed],
		ephemeral: true,
	};
}//end function requesterNotInVoiceReply

/* Generates the reply message content for a 'requesting play in non-voice channel' error message. */
export function playInNonVoiceReply( nonVoiceChannel ) {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Unable to Process Request' );
	msgEmbed.setDescription( `Cannot play in non-voice channel ${nonVoiceChannel.toString()}.` );

	return {
		embeds: [msgEmbed],
		ephemeral: true,
	};
}//end function playInNonVoiceReply

/* Generates the reply message content for a 'requested user not in voice channel' error message. */
export function userNotInVoiceReply( userPlayAt ) {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Unable to Process Request' );
	msgEmbed.setDescription( `${userPlayAt.toString()} is not currently in a voice channel.` );

	return {
		embeds: [msgEmbed],
		ephemeral: true,
	};
}//end function userNotInVoiceReply

/* Generates the reply message content for an 'invalid request' error message. */
export function requestInvalidReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Unable to Process Request' );
	msgEmbed.setDescription( 'This request is invalid, please try a different request.' );

	return {
		embeds: [msgEmbed],
		ephemeral: true,
	};
}//end function requestInvalidReply

/* Generates the reply message content for a 'no results available' error message. */
export function noResultsReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Unable to Process Request' );
	msgEmbed.setDescription( 'There are no available results for this search.' );

	return {
		embeds: [msgEmbed],
		ephemeral: true,
	};
}//end function noResultsReply

/* Generates the reply message content for a 'successful play request' message. */
export function playSuccessReply( newRequest ) {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '✅  Play' );
	msgEmbed.setDescription( `Successfully queued [${newRequest.getTitle()}](${newRequest.getURL()}) for ${newRequest.getChannel().toString()}` );
	
	return {
		embeds: [msgEmbed],
		ephemeral: false,
	};
}//end function playSuccessReply

/* Generates the reply message content for a 'queue is empty' message. */
export function queueEmptyReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( 'Queue' );
	msgEmbed.setDescription( 'The queue is currently empty! Please add a request.' );

	return {
		embeds: [msgEmbed],
		ephemeral: true,
	};
}//end function noResultsReply

/* Generates the reply message content for a 'print queue' message. */
export async function queuePrintReply( guildQueue ) {

	let queueContents = '```'; //String representation of queue
	
	//Build queue string header
	queueContents += 'in.'.padEnd( 3, ' ' );
	queueContents += ' | ';
	queueContents += 'Title'.padEnd( 50, ' ' );
	queueContents += ' | ';
	queueContents += 'Channel'.padEnd( 32, ' ' );
	
	let i = 1;
	let index = '';
	let title = '';
	let channel = '';
	for( const entry of guildQueue ) {
		queueContents += '\n';
		
		//Index
		index = i.toString().padStart(2, '0');
		index += '.';
		queueContents += index;
		
		queueContents += '  ';
		
		//Title
		title = entry.getTitle();
		if( stringWidth(title) > 50 ) {
			
			//Find cutoff point for string width <= 50 halfwidth characters
			let firstExcl; //First index to exclude
			for( firstExcl = 1; firstExcl < title.length; ++firstExcl ) {
				if( stringWidth(title.substring(0, firstExcl)) >= 50 )
					break;
			}//end for
			
			title = title.substring(0, firstExcl - 1) + '…';
		}//end if
		while( stringWidth(title) < 50 )
				title += ' ';
		queueContents += title;
		
		queueContents += '   ';
		
		//Channel
		channel = entry.getChannel().name;
		if( channel.length > 20 )
			channel = channel.substring(0, 19) + '…';
		channel = channel.padEnd( 20, ' ' );
		
		queueContents += channel;
		
		if( i == 25 && guildQueue.length - i > 0 )  {
			queueContents += ('\n…and ' + (guildQueue.length - i) + ' more…');
			break;
		}//end if
		
		i++;
	}//end for
	queueContents += '```';
	
	console.log( queueContents.substring(3, queueContents.length - 3) ); //Log here instead of in calling function for convenience

	return {
		content: '**Queue:**\n' + queueContents,
		ephemeral: false,
	};
}//end function queuePrintReply

/* Generates the reply message content for a 'no requests to skip' message. */
export function noRequestsSkipReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( 'Skip' );
	msgEmbed.setDescription( 'The queue is already empty.' );
	
	return {
		embeds: [msgEmbed],
		ephemeral: false,
	};
}//end function noRequestsSkipReply

/* Generates the reply message content for a 'successful skip' message. */
export function successfulSkipReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '✅  Skip' );
	msgEmbed.setDescription( `Successfully skipped to the next valid request, if one exists.` );
	
	return {
		embeds: [msgEmbed],
		ephemeral: false,
	};
}//end function noRequestsSkipReply

/* Generates the reply message content for an 'unsuitable home channel' error message. */
export function unsuitableHomeReply( badHome ) {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Unable to Set Home Channel' );
	msgEmbed.setDescription( `${badHome.toString()} is not a suitable home channel. Please choose a valid text-based channel.` );

	return {
		embeds: [msgEmbed],
		ephemeral: true,
	};
}//end function unsuitableHomeReply

/* Generates the reply message content for an 'updated home channel' message. */
export function setHomeSuccessReply( newHome ) {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '✅  Home Channel' );
	msgEmbed.setDescription( `Successfully updated the home channel. New home channel: ${newHome.toString()}` );

	return {
		embeds: [msgEmbed],
		ephemeral: false,
	};
}//end function setHomeSuccessReply

/* Generates the reply message content for a 'cleared home channel' message. */
export function clearHomeSuccessReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '✅  Home Channel' );
	msgEmbed.setDescription( 'Successfully cleared the home channel.' );

	return {
		embeds: [msgEmbed],
		ephemeral: false,
	};
}//end function setHomeSuccessReply

/* Generates the home channel message content for a 'now playing' message. */
export async function nowPlayingMessage( request ) {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setDescription( `Now playing [${request.getTitle()}](${request.getURL()}) in ${request.getChannel().toString()}` );

	return {
		embeds: [msgEmbed],
	};
}//end function nowPlayingMessage

