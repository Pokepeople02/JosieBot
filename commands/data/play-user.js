'use strict';

import { SlashCommandBuilder } from '@discordjs/builders';

/** JSON data for /play-channel command, built with discord.js' SlashCommandBuilder. */
export const data = new SlashCommandBuilder()
	.setName( 'play-user' )
	.setDescription( 'Adds a request to the queue for the voice channel of a given user.' )
	.addUserOption( option => option
		.setName( 'user' )
		.setDescription( 'The user whose voice channel to play in.' )
		.setRequired( true )
	)
	.addStringOption( option => option
		.setName( 'request' )
		.setDescription( 'Your request to be played.' )
		.setRequired( true )
	);