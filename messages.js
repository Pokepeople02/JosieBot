'use strict';

import { MessageEmbed } from 'discord.js';
import stringWidth from 'string-width';

import { Status } from './bot-status.js';

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
	};
}//end function requestInvalidReply

/* Generates the reply message content for a 'no results available' error message. */
export function noResultsReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Unable to Process Request' );
	msgEmbed.setDescription( 'There are no available results for this search.' );

	return {
		embeds: [msgEmbed],
	};
}//end function noResultsReply

/* Generates the reply message content for a 'successful play request' message. */
export function playSuccessReply( newRequest ) {
	const msgEmbed = new MessageEmbed();
	let lengthString = ''; //Length field string
	
	if( newRequest.isLiveStream() ) lengthString = "🔴 LIVE";
	else lengthString = newRequest.getLength();
		
	msgEmbed.setTitle( '✅  Play' );
	msgEmbed.setDescription( `Successfully queued [${newRequest.getTitle()}](${newRequest.getURL()}) for ${newRequest.getChannel().toString()}\n` );
	msgEmbed.setThumbnail( newRequest.getThumbnailURL() );
	msgEmbed.addField( 'Length', lengthString, true );
	msgEmbed.addField( 'Uploaded By', newRequest.getCreatorName(), true );
	
	return {
		embeds: [msgEmbed],
	};
}//end function playSuccessReply

/* Generates the reply message content for a 'queue is empty' message. */
export function queueEmptyReply() {
	
	return {
		content: '**Queue:**\n```\nThe queue is currently empty! Please add a request.\n```', 
	};
}//end function noResultsReply

/* Generates the reply message content for a 'print queue' message. */
export async function queuePrintReply( guildSub ) {

	const guildQueue = guildSub.getQueue();
	let queueContents = '```'; //String representation of queue
	let lengthString = ''; //String length field for entry i
	
	//Build queue string header
	queueContents += 'in.'.padEnd( 3, ' ' );
	queueContents += ' │ ';
	queueContents += 'Title'.padEnd( 40, ' ' );
	queueContents += ' │ ';
	queueContents += 'Length'.padEnd( 8, ' ' );
	queueContents += ' │ ';
	queueContents += 'Channel'.padEnd( 15, ' ' );
	queueContents += ' │ ';
	queueContents += 'Queued by'.padEnd( 20, ' ' );
	
	queueContents += '\n';
	queueContents = queueContents.padEnd( queueContents.length + 3, '─' );
	queueContents += '─┼─';
	queueContents = queueContents.padEnd( queueContents.length + 40, '─' );
	queueContents += '─┼─';
	queueContents = queueContents.padEnd( queueContents.length + 8, '─' );
	queueContents += '─┼─';
	queueContents = queueContents.padEnd( queueContents.length + 15, '─' );
	queueContents += '─┼─';
	queueContents = queueContents.padEnd( queueContents.length + 20, '─' );
	
	let i = 1;
	for( const entry of guildQueue ) {
		queueContents += '\n';
		
		//Index
		queueContents += i.toString().padStart(2, '0') + '.';
		
		//Title
		queueContents += ' │ ';
		queueContents += truncAndPadString( entry.getTitle(), 40 );
		
		//Length
		queueContents += ' │ ';
		if( i === 1 && guildSub.getStatus() === Status.Paused ) lengthString = "PAUSED";
		else if( entry.isLiveStream() ) lengthString = "🔴 LIVE";
		else lengthString = entry.getLength();
		queueContents += truncAndPadString( lengthString, 8 );
		
		//Channel
		queueContents += ' │ ';
		queueContents += truncAndPadString( entry.getChannel().name, 15 );
		
		//User
		queueContents += ' │ ';
		queueContents += truncAndPadString( entry.getUser().displayName, 20 );
		
		//Truncate queue to 25 entries
		if( i == 15 && guildQueue.length - i > 0 )  {
			queueContents += '\n';
			queueContents = queueContents.padEnd( queueContents.length + 3, '─' );
			queueContents += '─┴─';
			queueContents = queueContents.padEnd( queueContents.length + 40, '─' );
			queueContents += '─┴─';
			queueContents = queueContents.padEnd( queueContents.length + 7, '─' );
			queueContents += '─┴─';
			queueContents = queueContents.padEnd( queueContents.length + 15, '─' );
			queueContents += '─┴─';
			queueContents = queueContents.padEnd( queueContents.length + 20, '─' );
	
			queueContents += ('\n…and ' + (guildQueue.length - i) + ' more…');
			break;
		}//end if
		
		i++;
	}//end for
	queueContents += '```';
	
	console.log( queueContents.substring(3, queueContents.length - 3) ); //Log here instead of in calling function for convenience

	return {
		content: '**Queue:**\n' + queueContents,
	};
}//end function queuePrintReply

/* Generates the reply message content for a 'no requests to skip' message. */
export function noRequestsSkipReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( 'Skip' );
	msgEmbed.setDescription( 'The queue is already empty.' );
	
	return {
		embeds: [msgEmbed],
	};
}//end function noRequestsSkipReply

/* Generates the reply message content for a 'successful skip' message. */
export function successfulSkipReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '✅  Skip' );
	msgEmbed.setDescription( `Successfully skipped to the next valid request, if one exists.` );
	
	return {
		embeds: [msgEmbed],
	};
}//end function noRequestsSkipReply

/* Generates the reply message content for an 'unsuitable home channel' error message. */
export function unsuitableHomeReply( badHome ) {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Unable to Set Home Channel' );
	msgEmbed.setDescription( `${badHome.toString()} is not a suitable home channel. Please choose a non-thread text channel.` );

	return {
		embeds: [msgEmbed],
	};
}//end function unsuitableHomeReply

/* Generates the reply message content for an 'updated home channel' message. */
export function setHomeSuccessReply( newHome ) {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '✅  Home Channel' );
	msgEmbed.setDescription( `Successfully updated the home channel. New home channel: ${newHome.toString()}` );

	return {
		embeds: [msgEmbed],
	};
}//end function setHomeSuccessReply

/* Generates the reply message content for a 'cleared home channel' message. */
export function clearHomeSuccessReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '✅  Home Channel' );
	msgEmbed.setDescription( 'Successfully cleared the home channel.' );
	
	return {
		embeds: [msgEmbed],
	};
}//end function setHomeSuccessReply

/*	Generates the reply message contents for failure to pause due to not currently playing anything.	*/
export function pauseNotPlayingReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Cannot Pause' );
	msgEmbed.setDescription( 'Nothing is currently playing.' );
	
	return {
		embeds: [msgEmbed],
	};
}//end function pauseNotPlayingReply

/*	Generates the reply message contents for successfully pausing a request.	*/
export function pauseSuccessfulReply( pausedRequest ) {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '✅  Paused' );
	msgEmbed.setDescription( `[${pausedRequest.getTitle()}](${pausedRequest.getURL()}) has been paused.` );
	
	return {
		embeds: [msgEmbed],
	};
}//end function pauseSuccessfulReply

/*	Generates the reply message contents for failure to unpause due to not being paused.	*/
export function unpauseNotPausedReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Cannot Unpause' );
	msgEmbed.setDescription( 'Nothing is currently paused.' );
	
	return {
		embeds: [msgEmbed],
	};
}//end function unpauseNotPausedReply

/*	Generates the reply message contents for successfully unpausing a paused request.	*/
export function unpauseSuccessfulReply( unpausedRequest ) {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '✅  Unpaused' );
	msgEmbed.setDescription( `[${unpausedRequest.getTitle()}](${unpausedRequest.getURL()}) has been unpaused.` );
	
	return {
		embeds: [msgEmbed],
	};
}//end function unpauseSuccessfulReply

/* Generates the home channel message content for a 'now playing' message. */
export async function nowPlayingMessage( request ) {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setDescription( `Now playing [${request.getTitle()}](${request.getURL()}) in ${request.getChannel().toString()}\n<${request.getUser()}>` );

	return {
		embeds: [msgEmbed],
	};
}//end function nowPlayingMessage

/*	Truncates a string to a given maximum visual width, taking into account half/full-width characters and other non-standard characters.
	Returns the final truncated string, padded to the maximum width with half-width spaces.
*/
function truncAndPadString( string, maxWidth ) {

	if( stringWidth(string) > maxWidth ) {
		//Find cutoff point for string width <= maxWidth # of halfwidth characters
		
		let firstExcl; //First index to exclude
		for( firstExcl = 1; firstExcl < string.length; ++firstExcl ) {
			if( stringWidth(string.substring(0, firstExcl)) >= maxWidth )
				break;
		}//end for
		
		string = string.substring(0, firstExcl - 1) + '…';
	}//end if
	
	//Pad with spaces
	while( stringWidth(string) < maxWidth )
		string += ' ';
	
	//Pad with arbitrary additional spaces to compensate for discord's strange formatting
	let numFullwidth = stringWidth(string) - string.length;
	for( let i = 0; i < Math.ceil((numFullwidth - 1) / 5); ++i )
	string += ' ';

	return string;
}//end function truncString