'use strict';

import { SlashCommandBuilder } from '@discordjs/builders';

/** JSON data for the /skip command, built with discord.js' SlashCommandBuilder. */
export const data = new SlashCommandBuilder()
	.setName( 'skip ' )
	.setDescription( 'Skips to the next request for a populated channel.' );