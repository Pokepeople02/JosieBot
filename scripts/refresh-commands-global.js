const fs = require( "fs" );
const { REST } = require( '@discordjs/rest' );
const { Routes } = require( 'discord-api-types/v10' );

const configPath = "../config"; //JSON file containing Discord authorization token and clientId
const commandsPath = "../out/src/commands/data/"; //Directory that contains command data files

let token;
let clientId;
let commandFiles;
let commandData;
let rest;

/******************** Get token and client ID ********************/

console.log( `Accessing Discord client ID and token at "${configPath}"` )

clientId = require( configPath ).clientId;
if ( clientId ) console.log( "Found client ID" );
else {
    console.log( "ERROR: Unable to find client ID. Has it been set?" );
    process.exit();
}//end if-else

token = require( configPath ).token;
if ( token ) console.log( "Found token" );
else {
    console.log( "ERROR: Unable to find token. Has it been set?" );
    process.exit();
}//end if-else

/******************** Get command data ********************/

console.log( `Accessing JSON command data at "${commandsPath}"` )

fs.access( commandsPath, fs.constants.R_OK, ( error ) => {

    if ( error ) {
        console.log( `ERROR: Unable to find command data. Has the project been built?` );
        process.exit();
    }//end if

    console.log( "Data directory found! Finding files..." );

    commandFiles = fs.readdirSync( commandsPath ).filter( file => file.endsWith( '.js' ) );
    commandData = [];

    for ( const file of commandFiles ) {
        let data;

        console.log( `Found "${file}"` );

        data = require( commandsPath + file ).data;
        if ( !data ) {
            console.log( `ERROR: Unable to find command data in "${file}". Skipping...` );
            continue;
        }//end if

        console.log( `Found data for /${data.name}` );

        commandData.push( data );
    }//end for

    console.log( "Connecting to the Discord REST API" );
    rest = new REST( { version: "10" } ).setToken( token );

    console.log( "Started refreshing application slash commands for all guilds..." );

    rest.put(
        Routes.applicationCommands( clientId ),
        { body: commandData }
    )
        .then( () => {
            console.log( "Successfully refreshed application slash commands for all guilds!" );
        } )
        .catch( ( error ) => {
            console.log( "ERROR: Failed to refresh commands! Error follows:\n" + error );
            process.exit();
        } );

} );