import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { token, clientId, guildId } from './config.json';
import fs from 'fs';

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const rest = new REST({ version: '9' }).setToken(token);

for (const file of commandFiles) {
	console.log(file);

	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);
		
		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();