import { Collection, GatewayIntentBits, Interaction } from "discord.js";
import * as config from "../config.json";
import { GuildContract } from "./guild-contract";
import { IsabelleClient } from "./isabelle-client";
import { Command } from "./command";
import fs = require( "node:fs" );
import path = require( "node:path" );

//Initialize globals
globalThis.client = new IsabelleClient( { intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] } );
globalThis.timeLimit = 3000;

//Gather commands
const commands = new Collection<string, Command>();
const commandsPath: string = path.join( __dirname, "commands/data" );
const commandFiles: string[] = fs.readdirSync( commandsPath ).filter( file => file.endsWith( ".js" ) );
for ( const fileName of commandFiles ) {
    const filePath: string = path.join( commandsPath, fileName );
    const command: Command = Object.values( require( filePath ) )[0] as Command;
    commands.set( command.data.name, command );
}//end for

globalThis.client.on( "ready", () => { globalThis.client.log( `Ready! Logged in as ${client.user!.tag}` ); } );

globalThis.client.on( "interactionCreate", async ( interaction: Interaction ) => {
    if ( !interaction.isChatInputCommand() || !interaction.inCachedGuild() ) return;

    globalThis.client.log( `${interaction.user.tag} executed ${interaction.toString()}`, interaction );

    if ( !globalThis.client.contracts.has( interaction.guildId ) )
        globalThis.client.contracts.set( interaction.guildId, new GuildContract( interaction.guildId ) );

    const contract = client.contracts.get( interaction.guildId )!;
    const command = commands.get( interaction.commandName );

    try {
        if ( !command ) {
            globalThis.client.log( `${interaction.user.tag} attempted unknown command "${interaction.commandName}"`, interaction );
            await interaction.reply( { content: `"/${interaction.commandName}" is not a recognized command.`, ephemeral: true } );
        }//end if
        else
            await command.execute( interaction );

    } catch ( error ) {
        globalThis.client.log( `Error during command: "${error as string}"`, interaction );

        try {
            if ( interaction.deferred ) interaction.editReply( "There was an error while executing this command!" );
            else if ( !interaction.replied ) interaction.reply( "There was an error while executing this command!" );
        } catch {} //end try-catch

    }//end try-catch

} );

globalThis.client.login( config.token );