'use strict';

import { SlashCommandBuilder } from '@discordjs/builders';

/** JSON data for /home-channel subcommands, built with discord.js' SlashCommandBuilder. */
export const data = new SlashCommandBuilder()
	.setName( 'home-channel' )
	.setDescription( 'Manages which text channel the bot sends messages to.' )
	.addSubcommand( subcommand => subcommand
		.setName( 'set' )
		.setDescription( 'Sets a new home channel for the bot.' )
		.addChannelOption( option => option
			.setName( 'channel' )
			.setDescription( 'The new home channel.' )
			.setRequired( true )
		)
	)
	.addSubcommand( subcommand => subcommand
		.setName( 'clear' )
		.setDescription( 'Unsets the home channel for the bot.' )
	);