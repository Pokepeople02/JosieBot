import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, GuildBasedChannel, InteractionReplyOptions } from "discord.js";
import { Command } from "../../Command";
import { setHomeChannel, clearHomeChannel } from "../execution/HomeChannel";
import { UnresolvedChannelError } from "../../errors/UnresolvedChannelError";
import { NonTextChannelError } from "../../errors/NonTextChannelError";

let HomeChannel: Command = {

    /** JSON data for /home-channel subcommands, built with discord.js' SlashCommandBuilder. */
    data: new SlashCommandBuilder()
        .setName( "home-channel" )
        .setDescription( "Manages which text channel the bot sends messages to." )
        .addSubcommand( subcommand => subcommand
            .setName( "set" )
            .setDescription( "Sets a new home channel for the bot." )
            .addChannelOption( option => option
                .setName( "channel" )
                .setDescription( "The new home channel." )
                .setRequired( true )
            )
        )
        .addSubcommand( subcommand => subcommand
            .setName( "clear" )
            .setDescription( "Unsets the home channel for the bot." )
        )
        .toJSON(),

    /** Determines the /home-channel subcommand to execute, and replies to the prompting interaction as appropriate. */
    async execute( interaction: ChatInputCommandInteraction<"cached"> ): Promise<void> {
        const contract = globalThis.client.contracts.get( interaction.guildId )!;
        const subcommand = interaction.options.getSubcommand();

        switch ( subcommand ) {
            case "set":
                let channel = interaction.options.getChannel( "channel", true )! as GuildBasedChannel; //API types shouldn't be returned, already cached

                try {
                    setHomeChannel( interaction, channel );

                    await interaction.reply( {
                        embeds: [{
                            title: "✅  Home Channel Set",
                            description: `Successfully updated the home channel to ${channel}.`
                        }],
                    } );

                } catch ( error ) {
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
                }//end try-catch

                break;
            case "clear":
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