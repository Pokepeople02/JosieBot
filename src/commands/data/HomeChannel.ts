import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, GuildBasedChannel } from "discord.js";
import { GuildContract } from "../../GuildContract";
import { Command } from "../../Command";
import { setHomeChannel, clearHomeChannel } from "../execution/HomeChannel";

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

    /** TODO: Unfinished */
    async execute( interaction: ChatInputCommandInteraction ): Promise<void> {
        let subcommand: string = interaction.options.getSubcommand();

        switch ( subcommand ) {
            case "set":
                setHomeChannel( interaction, interaction.options.getChannel( "channel", true )! as GuildBasedChannel );
                break;
            case "clear":
                clearHomeChannel( interaction );
                break;
            default:
                globalThis.client.log( `${interaction.user.tag} attempted unknown command "${interaction.commandName}"`, interaction );
                interaction.reply( { content: `"${subcommand}" is not a recognized subcommand of /home-channel.`, ephemeral: true } );
        }//end switch

        return;
    }//end method execute
};

export { HomeChannel };