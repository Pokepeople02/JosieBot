'use strict';

// Require the necessary discord.js classes
const fs = 						require('fs');
const { Client, Intents } = 	require('discord.js');
const { token } = 				require('./config.json');
const { GuildSubscription } = 	require('./guild-subscription.js');
const { play } = 				require('./commands/play.js');

// Create the global client instance
const client = new Client( {intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES]} );
globalThis.client = client;

//Create global Guild ID--to--GuildSubscription mapping
const subMap = new Map();
globalThis.subMap = subMap;

//On ready event, log in console that bot is ready.
client.once( 'ready', () => {
	console.log(`Ready! Logged in as ${client.user.tag}\n`);
} );


//On interaction event, log and respond to the interaction.
client.on('interactionCreate', async interaction => {
	//Log the interaction
	console.log(`\n${interaction.createdAt}: ${interaction.user.tag} triggered an interaction in guild '${interaction.guild.name}', channel '#${interaction.channel.name}'.`);
	console.log( 'Interaction:' );
	console.log( interaction.toString() + '\n' );
	
	//Disregard non-command interactions
	if ( !interaction.isCommand() ) {
		console.log('Invalid interaction: Non-command.');
		return;
	}//end if
	
	//If guild does not yet have a contract for the current guild, create one.
	if( !globalThis.subMap.has(interaction.guildId) ) {
		subMap.set( interaction.guildId, new GuildSubscription(interaction.guild) );
	}//end if
	
	//Handle individual command as appropriate
	try {
		
		switch( interaction.commandName ) {
			/*
			case 'help' : break;
			case 'jump' : break;
			case 'move' : break;
			*/
			case 'play' :
				await play(interaction);
				break;
			/*
			case 'queue' : break;
			case 'seek' : break;
			case 'sethome' : break;
			case 'settings' : break;
			case 'skip' : break;
			*/
			default :
				interaction.reply( {
					content: `Unknown command '${interaction.commandName}'! Please enter a valid command.`,
					ephemeral: true,
				} );
		}//end switch
		
	} catch (error) {
		console.error(error);
		
		await interaction.reply({ 
			content: 'There was an error while executing this command!', 
			ephemeral: true,
		});
    }//end try-catch
	
});

//Login to Discord
client.login(token);