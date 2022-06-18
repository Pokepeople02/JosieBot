'use strict';

import { SlashCommandBuilder } from '@discordjs/builders';

/** JSON data for /pause command, built with discord.js' SlashCommandBuilder. */
export const data = new SlashCommandBuilder()
	.setName( 'pause' )
	.setDescription( 'Pauses the currently playing request, if exists.' );