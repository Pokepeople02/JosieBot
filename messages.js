'use strict';

const { 
	MessageEmbed,
	MessageOptions,
} = require( 'discord.js' );

/* Generates the reply message content for an 'unknown command input' error message. */
module.exports.unknownCommandErrorReply = function unknownCommandErrorReply( commandStr ) {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Command Failed' );
	msgEmbed.setDescription( `"${commandStr}" is not a recognized command.` );

	return {
		embeds: [msgEmbed],
		ephemeral: true,
	};
}//end function unknownCommandErrorReply

/* Generates the reply message content for an 'unknown error during execution' error message. */
module.exports.execErrorReply = function execErrorReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Command Failed' );
	msgEmbed.setDescription( 'There was an error while executing this command!' );
	
	return {
		embeds: [msgEmbed],
		ephemeral: true,
	};
}//end function execErrorReply

/* Generates the reply message content for a 'queue locked for modification' error message. */
module.exports.queueLockedReply = function queueLockedReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Unable to Process Request' );
	msgEmbed.setDescription( 'The queue is currently being modified. Please try again later.' );
	
	return {
		embeds: [msgEmbed],
		ephemeral: true,
	};
}//end function queueLockedReply

/* Generates the reply message content for a 'requester is not in voice channel' error message. */
module.exports.requesterNotInVoiceReply = function requesterNotInVoiceReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Unable to Process Request' );
	msgEmbed.setDescription( 'You need to be in a voice channel to make requests with `/play a {request}`.' );
	
	return {
		embeds: [msgEmbed],
		ephemeral: true,
	};
}//end function requesterNotInVoiceReply

/* Generates the reply message content for a 'requesting play in non-voice channel' error message. */
module.exports.playInNonVoiceReply = function playInNonVoiceReply( nonVoiceChannel ) {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Unable to Process Request' );
	msgEmbed.setDescription( `Cannot play in non-voice channel ${nonVoiceChannel.toString()}.` );

	return {
		embeds: [msgEmbed],
		ephemeral: true,
	};
}//end function playInNonVoiceReply

/* Generates the reply message content for a 'requested user not in voice channel' error message. */
module.exports.userNotInVoiceReply = function userNotInVoiceReply( userPlayAt ) {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Unable to Process Request' );
	msgEmbed.setDescription( `${userPlayAt.toString()} is not currently in a voice channel.` );

	return {
		embeds: [msgEmbed],
		ephemeral: true,
	};
}//end function userNotInVoiceReply

/* Generates the reply message content for an 'invalid request' error message. */
module.exports.requestInvalidReply = function requestInvalidReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Unable to Process Request' );
	msgEmbed.setDescription( 'This request is invalid, please try a different request.' );

	return {
		embeds: [msgEmbed],
		ephemeral: true,
	};
}//end function requestInvalidReply

/* Generates the reply message content for a 'no results available' error message. */
module.exports.noResultsReply = function noResultsReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Unable to Process Request' );
	msgEmbed.setDescription( 'There are no available results for this search.' );

	return {
		embeds: [msgEmbed],
		ephemeral: true,
	};
}//end function noResultsReply

/* Generates the reply message content for a 'successful play request' message. */
module.exports.playSuccessReply = function playSuccessReply( newRequest ) {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '✅  Play' );
	msgEmbed.setDescription( `Successfully queued [${newRequest.getTitle()}](${newRequest.getURL()}) for ${newRequest.getChannel().toString()}` );
	
	return {
		embeds: [msgEmbed],
		ephemeral: false,
	};
}//end function playSuccessReply

/* Generates the reply message content for a 'queue is empty' message. */
module.exports.queueEmptyReply = function queueEmptyReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( 'Queue' );
	msgEmbed.setDescription( 'The queue is currently empty! Please add a request.' );

	return {
		embeds: [msgEmbed],
		ephemeral: true,
	};
}//end function noResultsReply

/* Generates the reply message content for a 'print queue' message. */
module.exports.queuePrintReply = async function queuePrintReply( guildQueue ) {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( 'Queue' );
	
	/* Build queue string contents*/
	queueContents += '```';
	let i = 0;
	let title = '';
	for( const entry of guildQueue ) {
		title = await entry.getTitle();
		
		if( i !== 0 ) queueContents += '\n'; //Newline
		queueContents += `${i.toString().padStart(2, '0')}. `; //Index
		queueContents += (`"${title.substring(0, title.length > 50 ? 47 : title.length - 3) + ( title.length > 50 ? '...' : title.substring(title.length - 3, title.length) )}"`).padEnd(52, ' ') + '\t'; //Request title
		queueContents += `Channel: ${entry.getChannel().name}` //Request channel
		
		if( i == 5 && guildQueue.length - i > 0 )  {
			queueContents += ('\n...and ' + (guildQueue.length - i) + ' more...');
			break;
		}//end if
		
		i++;
	}//end for
	queueContents += '```';
	
	console.log( queueContents ); //Log here instead of in calling function for convenience
	
	msgEmbed.setDescription( queueContents );

	return {
		embeds: [msgEmbed],
		ephemeral: false,
	};
}//end function queuePrintReply

/* Generates the reply message content for a 'no requests to skip' message. */
module.exports.noRequestsSkipReply = function noRequestsSkipReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( 'Skip' );
	msgEmbed.setDescription( 'The queue is already empty.' );
	
	return {
		embeds: [msgEmbed],
		ephemeral: false,
	};
}//end function noRequestsSkipReply

/* Generates the reply message content for a 'successful skip' message. */
module.exports.successfulSkipReply = function successfulSkipReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '✅  Skip' );
	msgEmbed.setDescription( `Successfully skipped to the next valid request, if one exists.` );
	
	return {
		embeds: [msgEmbed],
		ephemeral: false,
	};
}//end function noRequestsSkipReply

/* Generates the reply message content for an 'unsuitable home channel' error message. */
module.exports.unsuitableHomeReply = function unsuitableHomeReply( badHome ) {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '❌  Unable to Set Home Channel' );
	msgEmbed.setDescription( `${badHome.toString()} is not a suitable home channel. Please choose a valid text-based channel.` );

	return {
		embeds: [msgEmbed],
		ephemeral: true,
	};
}//end function unsuitableHomeReply

/* Generates the reply message content for an 'updated home channel' message. */
module.exports.setHomeSuccessReply = function setHomeSuccessReply( newHome ) {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '✅  Home Channel' );
	msgEmbed.setDescription( `Successfully updated the home channel. New home channel: ${newHome.toString()}` );

	return {
		embeds: [msgEmbed],
		ephemeral: false,
	};
}//end function setHomeSuccessReply

/* Generates the reply message content for a 'cleared home channel' message. */
module.exports.clearHomeSuccessReply = function clearHomeSuccessReply() {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setTitle( '✅  Home Channel' );
	msgEmbed.setDescription( 'Successfully cleared the home channel.' );

	return {
		embeds: [msgEmbed],
		ephemeral: false,
	};
}//end function setHomeSuccessReply

/* Generates the home channel message content for a 'now playing' message. */
module.exports.nowPlayingMessage = async function nowPlayingMessage( request ) {
	const msgEmbed = new MessageEmbed();
	msgEmbed.setDescription( `Now playing [${request.getTitle()}](${request.getURL()}) in ${request.getChannel().toString()}` );

	return {
		embeds: [msgEmbed],
	};
}//end function nowPlayingMessage

