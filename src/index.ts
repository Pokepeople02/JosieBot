import { Collection, DiscordAPIError, GatewayIntentBits, Interaction } from "discord.js";
import * as config from "../config.json";
import { GuildContract } from "./GuildContract";
import { IsabelleClient } from "./IsabelleClient";
import { Command } from "./Command";
import fs = require( "node:fs" );
import path = require( "node:path" );

import { setToken } from "play-dl";


let resolvedPath = path.resolve( __dirname );

//Initialize globals
globalThis.client = new IsabelleClient( { intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] } );
globalThis.promiseTimeout = 3_000; //3 sec.
globalThis.waitingTimeout = 600_000; //10 min.
globalThis.standbyTimeout = 120_000; //2 min.
globalThis.rootPath = resolvedPath.substring( 0, resolvedPath.lastIndexOf( '\\' ) );
globalThis.dataDirectory = globalThis.rootPath + "\\data";

//Make folder for contract data and load any existing contracts
if ( fs.existsSync( globalThis.dataDirectory ) ) {
    fs.readdirSync( globalThis.dataDirectory ).forEach( filename => {
        let oldContract: GuildContract;

        try { oldContract = globalThis.client.readContractFromFile( globalThis.dataDirectory + "\\" + filename ); }
        catch { return; } //Ignore erroneous files

        globalThis.client.contracts.set( oldContract.guildId, oldContract );
        globalThis.client.log( `Loaded contract for guild with ID ${oldContract.guildId}` );
    } );
} else {
    fs.mkdirSync( globalThis.dataDirectory );
}

//Gather commands
const commands = new Collection<string, Command>();
const commandsPath: string = path.join( __dirname, "commands", "data" );
const commandFiles: string[] = fs.readdirSync( commandsPath ).filter( file => file.endsWith( ".js" ) );

for ( const fileName of commandFiles ) {
    const filePath: string = path.join( commandsPath, fileName );
    const command: Command = require( filePath ) as Command;

    if ( !command?.data ) {
        globalThis.client.log( `Command data file "${fileName}" lacks data! Exiting...` );
        process.exit( 1 );
    } else if ( !command?.execute ) {
        globalThis.client.log( `Command data file "${fileName}" lacks execute()! Exiting...` );
        process.exit( 1 );
    }//end if-else

    commands.set( command.data.name, command );
}//end for

globalThis.client.on( "ready", () => { globalThis.client.log( `Ready! Logged in as ${client.user!.tag}` ); } );

globalThis.client.on( "interactionCreate", async ( interaction: Interaction ) => {
    if ( !interaction.isChatInputCommand() || !interaction.inCachedGuild() ) return;

    globalThis.client.log( `${interaction.user.tag} executed ${interaction.toString()}`, interaction );

    try {
        if ( !globalThis.client.contracts.has( interaction.guildId ) ) {
            let newContract = new GuildContract( interaction.guildId );
            globalThis.client.contracts.set( interaction.guildId, newContract );
            globalThis.client.writeContractToFile( newContract );
        }
    } catch ( error ) {
        globalThis.client.log( `Failed to create contract -- ${error}` );
        return;
    }//end try-catch

    const command = commands.get( interaction.commandName );

    try {
        if ( !command ) {
            globalThis.client.log( `${interaction.user.tag} attempted unknown command "${interaction.commandName}"`, interaction );
            await interaction.reply( { content: `"/${interaction.commandName}" is not a recognized command.`, ephemeral: true } );
        }//end if
        else
            await command.execute( interaction );

    } catch ( error ) {
        globalThis.client.log( `Unexpected error during command -- ${error instanceof Error ? error!.stack : error}`, interaction );

        //No way to recover, just give up
        if ( error instanceof DiscordAPIError )
            return;

        try {
            if ( interaction.deferred ) interaction.editReply( "There was an error while executing this command!" );
            else if ( !interaction.replied ) interaction.reply( "There was an error while executing this command!" );
        } catch ( error ) {
            globalThis.client.log( "Couldn't respond to interaction: " + error );
            return;
        } //end try-catch

    }//end try-catch

    return;
} );

//Set YouTube cookies, if applicable
if ( config.youtubeCookies ) {
    setToken( {
        youtube: {
            cookie: config.youtubeCookies
        }
    } ).then( () => {
        globalThis.client.log( "Loaded YouTube cookie data." );
    } );

}//end if

globalThis.client.login( config.token );
