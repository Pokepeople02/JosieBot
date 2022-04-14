'use strict';

import { SlashCommandBuilder } 	from '@discordjs/builders';

import {
	unpauseNotPausedReply,
	unpauseSuccessfulReply,
} 								from '../messages.js';
import { Status } 				from '../bot-status.js';

/* JSON data for /pause command, built with discord.js' SlashCommandBuilder. */
export const data = new SlashCommandBuilder()
	.setName( 'unpause' )
	.setDescription( 'Unpauses the currently playing request, if paused.' );
	
/*	Attempts to unpause the current request for the specified guild.	*/
export async function unpause( interaction, guildSub ) {
	
	//If not paused, print message and stop
	if( guildSub.getStatus() !== Status.Paused ) {
		console.log( 'Unpause failed: Not paused.' );
		await interaction.editReply( unpauseNotPausedReply() );
		return;
	}//end if
	
	await guildSub.resume();
	
	console.log( 'Unpause successful' );
	await interaction.editReply( unpauseSuccessfulReply(guildSub.getQueue()[0]) );
	return;
}//end function unpause