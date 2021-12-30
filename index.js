'use strict';

// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
const { GuildContract } = require('./guild-contract.js');
const { play } = require('./commands/play.js');
const fs = require('fs');

// Create a new client instance
const client = new Client( {intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES]} );

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

//Create Guild:GuildContract mapping to store queues and guild-specific information about bot status
const contractMap = new Map();

//Respond to interactions
client.on('interactionCreate', async interaction => {
	//Disregard non-command interactions
	if ( !interaction.isCommand() ) return;
	
	//Log command
	console.log( interaction.toString() );
	
	//If guild does not yet have a contract for the current guild, create one.
	if( !contractMap.get(interaction.guild) ) {
		console.log( `Creating new contract for guild '${interaction.guild.name}'` );
		contractMap.set( interaction.guild, new GuildContract(interaction.guild) );
	}//end if
	
	//Handle individual command as appropriate
	try {
		if( interaction.commandName === 'play' ) 	await play(interaction, contractMap.get(interaction.guild) );
		else										throw 'Error: Unrecognized command';
	} catch (error) {
		
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true});
		
    }//end try-catch
});

//Login to Discord
client.login(token);