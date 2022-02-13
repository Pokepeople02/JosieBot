'use strict';

const { SlashCommandBuilder } = require( '@discordjs/builders' );

/* JSON data for the /skip command, built with discord.js' SlashCommandBuilder. */
module.exports.data = new SlashCommandBuilder()
	.setName( 'skip ' )
	.setDescription( 'Stops the currently playing request and skips to the next one to be played in a populated channel.' );

/* Skips to the next valid request in the queue of the supplied guild subscription. */
module.exports.skip = async function skip( interaction, guildSub ) {
	
	if( guildSub.isQueueLocked() ) {
		//If queue is locked, skip fails.
		
		console.log( 'Command failed: Queue locked.' );
		await interaction.editReply( 'Unable to skip: The queue is currently being modified. Please try again in a moment.' );
		
		return;
	}//end if
	
	if( guildSub.getQueue().length === 0 ) {
		//If queue is empty, skip fails.
		
		interaction.editReply( 'Unable to skip: The queue is currently empty.' );
		return;
	}//end if
	
	await guildSub.transition(); //Transition handles queue locking
	await interaction.editReply( 'Skipped to the next valid request.' );
	
	return;
}//end function skip