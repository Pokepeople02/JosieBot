import { SlashCommandBuilder, ChatInputCommandInteraction, Collection, Snowflake, ApplicationCommand, StageChannel, VoiceBasedChannel, GuildDefaultMessageNotifications } from "discord.js";
import { Request } from "../../requests/Request";
import { play } from "../execution/Play";
import { getPlayFailedResponseEmbed } from "./Play";

/** JSON data for the /play command. */
export const data = new SlashCommandBuilder()
    .setName( 'play-user' )
    .setDescription( 'Adds a request to the queue for the voice channel of a given user.' )
    .addUserOption( option => option
        .setName( 'user' )
        .setDescription( 'The user whose voice channel to play in.' )
        .setRequired( true )
    )
    .addStringOption( option => option
        .setName( 'request' )
        .setDescription( 'Your request to be played.' )
        .setRequired( true )
    )
    .toJSON();

/** Determines the voice channel of the calling user, initiates the behavior to handle the request made, and replies to the prompting interaction. */
export async function execute( interaction: ChatInputCommandInteraction<"cached"> ): Promise<void> {
    const user = interaction.options.getUser( "user", true );
    const guildMember = interaction.guild.members.resolve( user.id );
    let userVoice: null | VoiceBasedChannel = guildMember?.voice?.channel ?? null;
    let request: Request;
    let commands: Collection<Snowflake, ApplicationCommand> = await globalThis.client.application!.commands.fetch();
    let playId: Snowflake = commands.filter( command => command.name === "play" ).first()!.id;
    let playChannelId: Snowflake = commands.filter( command => command.name === "play-channel" ).first()!.id;

    if ( !guildMember ) {
        await interaction.reply( {
            embeds: [{
                title: "❌  Unable to Add Request",
                description: `${user.toString()} is not a member of this server. Provide a member of this server currently in a voice channel, or use either ` +
                    `</play-channel:${playChannelId}> or </play-user:${playId}> to add requests.`,
            }],
        } );

        return;
    } else if ( !userVoice ) {
        await interaction.reply( {
            embeds: [{
                title: "❌  Unable to Add Request",
                description: `${user.toString()} is not currently in a voice channel. Provide a user currently in a voice channel, or ` +
                    `I guess tell ${user.toString()} to hop in a voice channel or something.`,
            }],
        } );

        return;
    }//end if-else

    await interaction.deferReply();

    //Initiate play or respond if failed
    try { request = await play( interaction, userVoice.id! ); }
    catch ( error ) {

        globalThis.client.log( `Failed to add request -- ${error}`, interaction );
        await interaction.editReply( { embeds: [getPlayFailedResponseEmbed( error )] } );

        return;
    }//end try-catch

    //Reply for play success
    await interaction.editReply( {
        embeds: [{
            title: "✅  Added a Request",
            description: `Successfully queued [${request.title!}](${request.resourceUrl!}) for ${user.toString()}'s channel (${userVoice.toString()}).`,
            thumbnail: request.thumbnailUrl ? { url: request.thumbnailUrl } : undefined,
            fields: [{
                name: "Duration",
                value: request.lengthFormatted!,
                inline: true,
            }, {
                name: "Uploaded by",
                value: request.creator!,
                inline: true,
            }]
        }],
    } );

    return;
}//end method execute