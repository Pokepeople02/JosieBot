import { ChatInputCommandInteraction } from "discord.js";
import { GuildContract } from "../../guild-contract";


export function clearHomeChannel( interaction: ChatInputCommandInteraction, contract: GuildContract ) {
    contract.homeId = null;

    interaction.reply( {
        embeds: [{
            title: "✅  Home Channel Cleared",
            description: "Successfully cleared the home channel."
        }],
    } );

    return;
}//end function clearHomeChannel