'use strict';

import { SlashCommandBuilder } from '@discordjs/builders';

/** JSON data for /pause command, built with discord.js' SlashCommandBuilder. */
export const data = new SlashCommandBuilder()
	.setName( 'unpause' )
	.setDescription( 'Unpauses the currently playing request, if paused.' );