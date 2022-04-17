import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { token, clientId } from './config.js';
import fs from 'fs';

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const rest = new REST({ version: '9' }).setToken(token);

for (const file of commandFiles) {
	console.log(file);

	import(`./commands/${file}`).then( (command) => { commands.push(command.data.toJSON()); } );
}

(async () => {
	try {
		console.log('Started refreshing application (/) commands for all guilds.');
		
		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands for all guilds.');
	} catch (error) {
		console.error(error);
	}
})();