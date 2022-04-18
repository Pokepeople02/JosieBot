const { REST } = require( '@discordjs/rest' );
const { Routes } = require( 'discord-api-types/v9' );
const fs = require( 'fs' );

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

(async () => {
	for (const file of commandFiles) {
		console.log(file);
	
		const command = await import(`./commands/${file}`);
		commands.push(command.data.toJSON());	
	}//end for

	const { token, clientId, guildId } = await import( './config.js' );
	const rest = new REST({ version: '9' }).setToken(token);
	
	try {
		console.log('Started refreshing application (/) commands for specified guild.');
		
		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands for specified guild.');
	} catch (error) {
		console.error(error);
	}
})();