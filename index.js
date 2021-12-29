'use strict';

// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
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

//TODO: Create queue:guild mapping to store queues

//Respond to interactions
client.on('interactionCreate', async interaction => {
	//Disregard non-command interactions
	if ( !interaction.isCommand() ) return;
	
	//Log command
	console.log( interaction.toString() );
	
	//Handle individual command as appropriate
	try {
		if( interaction.commandName === 'play' ) 	await play(interaction);
		else										throw 'Error: Unrecognized command';
	} catch (error) {
		
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true});
		
    }//end try-catch
});

//Login to Discord
client.login(token);