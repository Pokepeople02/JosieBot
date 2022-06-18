'use strict';

import { SlashCommandBuilder } from '@discordjs/builders';

/** JSON data for /play-channel command, built with discord.js' SlashCommandBuilder. */
export const data = new SlashCommandBuilder()
	.setName( 'play-channel' )
	.setDescription( 'Adds a request to the queue for a given voice channel.' )
	.addChannelOption( option => option
		.setName( 'channel' )
		.setDescription( 'The channel to play in.' )
		.setRequired( true )
	)
	.addStringOption( option => option
		.setName( 'request' )
		.setDescription( 'Your request to be played.' )
		.setRequired( true )
	);