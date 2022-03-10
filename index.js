'use strict';

const { Client, Intents } = 	require( 'discord.js' );

const { token } = 				require( './config.json' );
const { GuildSubscription } = 	require( './guild-subscription.js' );
const { play } = 				require( './commands/play.js' );
const { queue } =				require( './commands/queue.js' );
const { skip } =				require( './commands/skip.js' );
const { home_channel } =		require( './commands/home-channel.js' );

globalThis.client = new Client( {
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_VOICE_STATES,
	],
} );

const subMap = new Map();

client.once( 'ready', () => {
	console.log( `Ready! Logged in as ${client.user.tag}\n` );
} );

client.on( 'interactionCreate', async interaction => {
	//On interaction event, log and respond to the interaction
	console.log(`\n${interaction.createdAt}: ${interaction.user.tag} triggered an interaction in guild '${interaction.guild.name}', channel '#${interaction.channel.name}'.`);
	console.log( 'Interaction: ' + interaction.toString() );
	
	if ( !interaction.isCommand() ) {
		//Disregard non-command interactions
		
		console.log( 'Invalid interaction: Non-command.' );
		return;
	}//end if
	
	if( !subMap.has(interaction.guildId) ) {
		//If subscription does not exist for current guild, create one
		subMap.set( interaction.guildId, new GuildSubscription(interaction.guild) );
	}//end if
	
	try { await interaction.deferReply(); } 
	catch( error1 ) {
		//Discord.js can sometimes randomly error upon defer. Nothing can be done but let it fail.
		console.log( 'Immediate deferral bug detected. Command failure.' );
		return;
	}//end try-catch
	
	try {
		const guildSub = subMap.get( interaction.guildId );
		
		switch( interaction.commandName ) {
			case 'play' :
				await play( interaction, guildSub );
				break;
			case 'queue' : 
				await queue( interaction, guildSub ) ;
				break;
			case 'skip' : 
				await skip( interaction, guildSub );
				break;
			case 'home-channel' :
				await home_channel( interaction, guildSub );
				break;
			default :
				interaction.editReply( {
					content: 	`Unknown command '${interaction.commandName}'! Please enter a valid command.`,
					ephemeral: 	true,
				} );
		}//end switch
		
	} catch( error ) {
		console.error( error );
		
		await interaction.editReply( { 
			content: 'There was an error while executing this command!', 
			ephemeral: true,
		} );
		
    }//end try-catch
	
	return;
});

client.login(token);