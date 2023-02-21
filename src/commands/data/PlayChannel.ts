import { SlashCommandBuilder, ChatInputCommandInteraction, ApplicationCommand, Collection, Snowflake, StageChannel } from "discord.js";
import { Command } from "../../Command";
import { play } from "../execution/Play";
import { Request } from "../../requests/Request";
import { getPlayFailedResponseEmbed } from "./Play";


/**Contains JSON data for the /play command and a method for responding to /play calls. */
let PlayChannel: Command = {

    /** JSON data for the /play command. */
    data: new SlashCommandBuilder()
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
        )
        .toJSON(),

    /** Determines the voice channel of the calling user, initiates the behavior to handle the request made, and replies to the prompting interaction. */
    async execute( interaction: ChatInputCommandInteraction<"cached"> ): Promise<void> {
        const user = interaction.member;
        const channel = interaction.options.getChannel( "channel", true );
        let request: Request;
        let commands: Collection<Snowflake, ApplicationCommand> = await globalThis.client.application!.commands.fetch();
        let playId: Snowflake = commands.filter( command => command.name === "play" ).first()!.id;
        let playUserId: Snowflake = commands.filter( command => command.name === "play-user" ).first()!.id;

        if ( !channel.isVoiceBased() ) {
            await interaction.reply( {
                embeds: [{
                    title: "❌  Unable to Add Request",
                    description: `${channel.toString()} is not a voice channel in this server. Provide a voice channel to play in, or use either `
                        + `</play:${playId}> or </play-user:${playUserId}> to add requests.`,
                }],
            } );

            return;
            //Stage channels not supported
        } else if ( channel instanceof StageChannel ) {
            await interaction.reply( {
                embeds: [{
                    title: "❌  Unable to Add Request",
                    description: `Cannot play in ${channel.toString()}, stage channels are not currently supported. Please provide a different voice channel to play in.`,
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
};

export { PlayChannel };