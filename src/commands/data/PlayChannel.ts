import { SlashCommandBuilder, ChatInputCommandInteraction, StageChannel } from "discord.js";
import { play } from "../execution/Play";
import { Request } from "../../requests/Request";
import { getPlayFailedResponseEmbed, getPlaySuccessEmbedFields } from "./Play";

/** JSON data for the /play command. */
export const data = new SlashCommandBuilder()
    .setName( "play-channel" )
    .setDescription( "Adds a new request to the queue for a given voice channel." )
    .addChannelOption( option => option
        .setName( 'channel' )
        .setDescription( 'The channel to play in.' )
        .setRequired( true )
    )
    .addStringOption( option => option
        .setName( "request" )
        .setDescription( "Your request to be played." )
        .setRequired( true )
    )
    .toJSON();

/** Determines the voice channel of the calling user, initiates the behavior to handle the request made, and replies to the prompting interaction. */
export async function execute( interaction: ChatInputCommandInteraction<"cached"> ): Promise<void> {
    const channel = interaction.options.getChannel( "channel", true );
    let request: Request;

    if ( !channel.isVoiceBased() ) {

        globalThis.client.log( "Failed /play-channel: non-voice channel", interaction );
        await interaction.reply( {
            embeds: [{
                title: "❌  Unable to Add Request",
                description: `${channel.toString()} is not a voice channel. Provide a voice channel to play in or use a different command to add requests.`,
            }],
        } );

        return;
        //Stage channels not supported
    } else if ( channel instanceof StageChannel ) {

        globalThis.client.log( "Failed /play-channel: trying to play in stage", interaction );
        await interaction.reply( {
            embeds: [{
                title: "❌  Unable to Add Request",
                description: `Cannot play in ${channel.toString()} as stage channels are not currently supported. Please try a different channel.`,
            }],
        } );

        return;
    }//end if-else

    await interaction.deferReply();

    //Initiate play or respond if failed
    try { request = await play( interaction, channel.id ); }
    catch ( error ) {

        globalThis.client.log( `Failed to add request -- ${error}`, interaction );
        await interaction.editReply( { embeds: [getPlayFailedResponseEmbed( error )] } );

        return;
    }//end try-catch

    //Reply for play success
    await interaction.editReply( {
        embeds: [{
            title: "✅  Added a Request",
            description: `Successfully queued [${request.title!}](${request.resourceUrl!}) for ${channel.toString()}.`,
            thumbnail: request.thumbnailUrl ? { url: request.thumbnailUrl } : undefined,
            fields: getPlaySuccessEmbedFields( request )
        }],
    } );

    return;
}//end method execute