'use strict';

import { SlashCommandBuilder } from '@discordjs/builders';

/** JSON data for the /queue command, built with discord.js' SlashCommandBuilder. */
export const data = new SlashCommandBuilder()
	.setName( 'queue' )
	.setDescription( 'Sends a reply displaying the upcoming requests in the queue.' );