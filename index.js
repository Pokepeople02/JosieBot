'use strict';

import { Client, Intents } 		from 'discord.js';
		
import { token } 				from './config.js';

import { GuildSubscription } 	from './guild-subscription.js';
import { play } 				from './commands/play.js';
import { queue } 				from './commands/queue.js';
import { skip } 				from './commands/skip.js';
import { home_channel } 		from './commands/home-channel.js';
import { pause }				from './commands/pause.js';
import { unpause }				from './commands/unpause.js';
import { 
	unknownCommandErrorReply,
	execErrorReply,
} 								from './messages.js';

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
		console.error( 'Immediate deferral bug detected. Command failure.' );
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
			case 'pause' :
				await pause( interaction, guildSub );
				break;
			case 'unpause' :
				await unpause( interaction, guildSub );
				break;
			default :
				console.error( 'Commmand failed: Unknown command ' + interaction.commandName );
				await interaction.editReply( unknownCommandErrorReply(interaction.commandName) );
		}//end switch
		
	} catch( error ) {
		console.error( error );
		await interaction.editReply( execErrorReply() );
    }//end try-catch
	
	return;
});

client.login(token);