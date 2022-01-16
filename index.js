'use strict';

// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
const { GuildSubscription } = require('./guild-subscription.js');
const { play } = require('./commands/play.js');
const fs = require('fs');

// Create the global client instance
const client = new Client( {intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES]} );
globalThis.client = client;

//Ready event files
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

//Load client events from files
for (const file of eventFiles) {
	const event = require(`./events/${file}`);

	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
    }//end if-else
}//end for

//Create global Guild ID--to--GuildSubscription mapping
//Stores queues and guild-specific information about bot status
const subMap = new Map();
globalThis.subMap = subMap;

//Respond to interactions
client.on('interactionCreate', async interaction => {
	//Disregard non-command interactions
	if ( !interaction.isCommand() ) return;
	
	//Log command
	console.log( interaction.toString() );
	
	//If guild does not yet have a contract for the current guild, create one.
	if( !globalThis.subMap.has(interaction.guildId) ) {
		subMap.set( interaction.guildId, new GuildSubscription(interaction.guild) );
	}//end if
	
	//Handle individual command as appropriate
	try {
		switch( interaction.commandName ) {
			case 'help' : break;
			case 'jump' : break;
			case 'move' : break;
			case 'play' :
				await play(interaction);
				break;
			case 'queue' : break;
			case 'seek' : break;
			case 'sethome' : break;
			case 'settings' : break;
			case 'skip' : break;
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