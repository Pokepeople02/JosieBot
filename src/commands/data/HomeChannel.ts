import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, GuildBasedChannel, InteractionReplyOptions } from "discord.js";
import { Command } from "../../Command";
import { setHomeChannel, clearHomeChannel } from "../execution/HomeChannel";
import { UnresolvedChannelError } from "../../errors/UnresolvedChannelError";
import { NonTextChannelError } from "../../errors/NonTextChannelError";

/**Contains JSON data for /home-channel commands and a method for responding to /home-channel calls. */
let HomeChannel: Command = {

    /** JSON data for /home-channel subcommands. */
    data: new SlashCommandBuilder()
        .setName( "home-channel" )
        .setDescription( "Manages which text channel the bot sends status messages to." )
        .addSubcommand( subcommand => subcommand
            .setName( "set" )
            .setDescription( "Sets the text channel the bot sends status messages to." )
            .addChannelOption( option => option
                .setName( "channel" )
                .setDescription( "The new home channel." )
                .setRequired( true )
            )
        )
        .addSubcommand( subcommand => subcommand
            .setName( "clear" )
            .setDescription( "Unsets what text channel the bot sends status messages to." )
        )
        .toJSON(),

    /** Determines the /home-channel subcommand to execute, executes the appropriate behavior, and replies to the prompting interaction. */
    async execute( interaction: ChatInputCommandInteraction<"cached"> ): Promise<void> {
        const contract = globalThis.client.contracts.get( interaction.guildId )!;
        const subcommand = interaction.options.getSubcommand();

        //Determine and execute appropriate behavior
        switch ( subcommand ) {
            case "set":
                let channel: GuildBasedChannel = interaction.options.getChannel( "channel", true )!;

                //Set home channel, or reply if failed
                try { setHomeChannel( interaction, channel ); }
                catch ( error ) {
                    const currHome = contract.homeId ? globalThis.client.channels.resolve( contract.homeId ) as GuildBasedChannel : null;
                    let replyContent: InteractionReplyOptions = { embeds: [] };

                    if ( error instanceof UnresolvedChannelError ) {
                        replyContent.embeds = [{
                            title: "❌  Unable to Set Home Channel",
                            description: `The provided channel cannot be found in a known server. Please choose a different channel.` +
                                `\nCurrent home channel: ${currHome ?? "None"}.`
                        }];

                    } else if ( error instanceof NonTextChannelError ) {
                        replyContent.embeds = [{
                            title: "❌  Unable to Set Home Channel",
                            description: `${channel} is not a text-based channel. Please choose a different channel.` +
                                `\nCurrent home channel: ${currHome ?? "None"}.`
                        }];

                    } else { //Unexpected
                        throw error;
                    }//end if-else

                    await interaction.reply( replyContent );

                    return;
                }//end try-catch

                //Reply for success
                await interaction.reply( {
                    embeds: [{
                        title: "✅  Home Channel Set",
                        description: `Successfully updated the home channel to ${channel}.`
                    }],
                } );

                break;
            case "clear":
                //Cannot fail
                clearHomeChannel( interaction );

                await interaction.reply( {
                    embeds: [{
                        title: "✅  Home Channel Cleared",
                        description: "Successfully cleared the home channel."
                    }],
                } );

                break;
            default:
                globalThis.client.log( `${interaction.user.tag} attempted unknown command "${interaction.commandName}"`, interaction );
                interaction.reply( { content: `"${subcommand}" is not a recognized subcommand of /home-channel.`, ephemeral: true } );
        }//end switch

        return;
    }//end method execute
};

export { HomeChannel };