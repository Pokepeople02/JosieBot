import { ChatInputCommandInteraction, CacheType, SlashCommandBuilder, GuildMember } from "discord.js";
import { Command } from "../../Command";
import { GuildContract } from "../../GuildContract";
import { processNewRequest } from "../execution/Play";

let Play: Command = {

    /** JSON data for /play subcommands, built with discord.js' SlashCommandBuilder. */
    data: new SlashCommandBuilder()
        .setName( "play" )
        .setDescription( "Adds a new request to the queue for your current voice channel." )
        .addStringOption( option => option
            .setName( "request" )
            .setDescription( "Your request to be played." )
        )
        .toJSON(),

    async execute( interaction: ChatInputCommandInteraction ): Promise<void> {
        //Check if user is in voice, handle channelId 0 differently

        await processNewRequest( interaction, ( interaction.member! as GuildMember ).voice.channelId! );
        return;
    }//end method execute
};

export { Play };