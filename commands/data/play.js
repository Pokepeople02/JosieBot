'use strict';

import { SlashCommandBuilder } from '@discordjs/builders';

/** JSON data for /play command, built with discord.js' SlashCommandBuilder. */
export const data = new SlashCommandBuilder()
	.setName( 'play' )
	.setDescription( 'Adds a request to the queue for your current voice channel.' )
	.addStringOption( option => option
		.setName( 'request' )
		.setDescription( 'Your request to be played.' )
		.setRequired( true )
	);