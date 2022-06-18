const { REST } = require( '@discordjs/rest' );
const { Routes } = require( 'discord-api-types/v9' );
const fs = require( 'fs' );

const commands = [];
const commandFiles = fs.readdirSync('./commands/data').filter(file => file.endsWith('.js'));

(async () => {
	for (const file of commandFiles) {
		console.log(file);
	
		const command = await import( `./commands/data/${file}` );
		commands.push(command.data.toJSON());	
	}//end for

	const { token, clientId } = await import( './config.js' );
	const rest = new REST({ version: '9' }).setToken(token);
	
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