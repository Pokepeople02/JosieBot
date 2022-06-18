'use strict';

import { SlashCommandBuilder } 	from '@discordjs/builders';

import {
	pauseNotPlayingReply,
	pauseSuccessfulReply,
} 								from '../messages.js';
import { Status } 				from '../bot-status.js';

/** JSON data for /pause command, built with discord.js' SlashCommandBuilder. */
export const data = new SlashCommandBuilder()
	.setName( 'pause' )
	.setDescription( 'Pauses the currently playing request, if one exists.' );

/** Attempts to pause the current request for the specified guild. */
export async function pause( interaction, guildSub ) {

	//If not playing, print message and stop
	if( guildSub.getStatus() !== Status.Playing ) {
		console.log( 'Pause failed: Not playing.' );
		await interaction.editReply( pauseNotPlayingReply() );
		return;
	}//end if
	
	await guildSub.pause();
	
	console.log( 'Pause successful' );
	await interaction.editReply( pauseSuccessfulReply(guildSub.getQueue()[0]) );
	
	return;
}//end function pause

