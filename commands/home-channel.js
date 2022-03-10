'use strict';

const { BaseGuildTextChannel }	= require( 'discord.js' );
const { SlashCommandBuilder } 	= require( '@discordjs/builders' );

/* JSON data for /home-channel subcommands, built with discord.js' SlashCommandBuilder. */
module.exports.data = new SlashCommandBuilder()
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
module.exports.home_channel = async function home_channel( interaction, guildSub ) {
	switch( interaction.options.getSubcommand() ) {
		case 'set' :
			let channel = interaction.options.getChannel('channel', true);
			
			if( !(channel instanceof BaseGuildTextChannel) ) {
				//Disregard non-text channels
				
				console.log( 'Invalid requested voice channel.' );
				await interaction.editReply( {
					content: `This channel is not suitable for a home channel. Please choose a valid text-based channel.`,
					ephemeral: true,
				} );
				
				return;
			}//end if
			
			console.log( `Setting home channel to '${channel?.name}'` );
			guildSub.setHomeChannel( channel );
			await interaction.editReply( 'Successfully updated the home channel.' );
			
			break;
		case 'clear' :
			guildSub.setHomeChannel( null );
			await interaction.editReply( 'Cleared the home channel.' );
			break;
		default :
			console.log( `Subcommand parsing failed: Unknown subcommand '${subcommand}'` );
			await interaction.editReply( `Unable to process request: Unknown subcommand '${subcommand}'` );
			return;
	}//end switch
	
	return;
}//end function home_channel