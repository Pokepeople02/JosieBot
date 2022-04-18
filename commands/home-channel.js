'use strict';

import { SlashCommandBuilder } 	from '@discordjs/builders';

import { 
	unknownCommandErrorReply,
	unsuitableHomeReply,
	setHomeSuccessReply,
	clearHomeSuccessReply
} 								from '../messages.js';

/* JSON data for /home-channel subcommands, built with discord.js' SlashCommandBuilder. */
export const data = new SlashCommandBuilder()
	.setName( 'home-channel' )
	.setDescription( 'Manages which channel the bot periodically sends messages to while playing.' )
	.addSubcommand( subcommand => subcommand
		.setName( 'set' )
		.setDescription( 'Sets which channel the bot will periodically send messages to while playing.' )
		.addChannelOption(option => option
			.setName( 'channel' )
			.setDescription( 'The bot\'s new home channel.' )
			.setRequired( true )
		) 
	)
	.addSubcommand( subcommand => subcommand
		.setName( 'clear' )
		.setDescription( 'Unsets the channel the bot sends messages to.' )
	);

/* Sets or unsets the home channel of the supplied guild subscription. */
export async function home_channel( interaction, guildSub ) {
	switch( interaction.options.getSubcommand() ) {
		case 'set' :
			let channel = interaction.options.getChannel('channel', true);
			
			if( !channel.isText() || channel.isThread() ) {
				//Disregard non-text channels
				console.log( 'Invalid requested voice channel.' );
				await interaction.editReply( unsuitableHomeReply(channel) );
				return;
			}//end if
			
			console.log( `Setting home channel to '${channel?.name}'` );
			guildSub.setHomeChannel( channel );
			
			await interaction.editReply( setHomeSuccessReply(channel) );
			break;
		case 'clear' :
			guildSub.setHomeChannel( null );
			await interaction.editReply( clearHomeSuccessReply() );
			break;
		default :
			console.log( `Subcommand parsing failed: Unknown subcommand '${subcommand}'` );
			await interaction.editReply( unknownCommandErrorReply('home-channel ' + subcommand) );
			return;
	}//end switch
	
	return;
}//end function home_channel