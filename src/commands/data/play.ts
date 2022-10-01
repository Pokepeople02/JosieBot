import { ChatInputCommandInteraction, CacheType, SlashCommandBuilder } from "discord.js";
import { Command } from "../../command";
import { GuildContract } from "../../guild-contract";

let play: Command = {

    /** JSON data for /play subcommands, built with discord.js' SlashCommandBuilder. */
    data: new SlashCommandBuilder()
        .setName( "play" )
        .setDescription( "Adds a new request to the queue for your current voice channel." )
        .addStringOption( option => option
            .setName( "request" )
            .setDescription( "" )
        )
        .toJSON(),

    async execute( interaction: ChatInputCommandInteraction, contract: GuildContract ): Promise<void> {
        throw new Error( "Function not implemented." );
    }//end method execute
};