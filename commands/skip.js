'use strict';

import { SlashCommandBuilder } from '@discordjs/builders';

import {
	queueLockedReply,
	noRequestsSkipReply,
	successfulSkipReply,
}								from '../messages.js';

/** JSON data for the /skip command, built with discord.js' SlashCommandBuilder. */
export const data = new SlashCommandBuilder()
	.setName( 'skip ' )
	.setDescription( 'Stops the currently playing request and skips to the next one to be played in a populated channel.' );

/** Skips to the next valid request in the queue of the supplied guild subscription. */
export async function skip( interaction, guildSub ) {
	
	if( guildSub.isQueueLocked() ) {
		//If queue is locked, skip fails.
		
		console.log( 'Command failed: Queue locked.' );
		await interaction.editReply( queueLockedReply() );
		
		return;
	}//end if
	
	if( guildSub.getQueue().length === 0 ) {
		//If queue is empty, skip fails.
		
		interaction.editReply( noRequestsSkipReply() );
		return;
	}//end if
	
	await guildSub.transition(); //Transition handles queue locking
	await interaction.editReply( successfulSkipReply() );
	
	return;
}//end function skip