'use strict';

const { SlashCommandBuilder } 	= require( '@discordjs/builders' );

const {
	queueEmptyReply,
	queuePrintReply,
} 								= require( '../messages.js' );

/* JSON data for the /queue command, built with discord.js' SlashCommandBuilder. */
module.exports.data = new SlashCommandBuilder()
	.setName( 'queue' )
	.setDescription( 'Replies with a message displaying the upcoming requests in the queue.' );

/* Prints the current queue of the supplied guild subscription. */
module.exports.queue = async function queue( interaction, guildSub ) {
	const queue = guildSub.getQueue(); //Queue of the supplied guild
	
	console.log( 'Printing the queue' );
	
	if( queue.length === 0 ) {
		console.log( 'The queue is currently empty.\n' );
		interaction.editReply( queueEmptyReply() );
		return;
	}//end if
	
	interaction.editReply( queuePrintReply(queue) );
	return;
}//end function queue