import { ChatInputCommandInteraction, Snowflake } from "discord.js";
import { GuildContract } from "../../GuildContract";
import { Request } from "../../requests/Request";
import { createRequest } from "../../requests/RequestFactory";

/**TODO: Unfinished */
export async function processNewRequest( interaction: ChatInputCommandInteraction, channelId: Snowflake ): Promise<void> {
    const contract = globalThis.client.contracts.get( interaction.guildId! )!;
    let request: Request;

    await interaction.deferReply();

    try {
        request = await createRequest(
            interaction.options.getString( "request", true ),
            interaction.member!.user.id,
            channelId
        );
    } catch ( error ) {
        globalThis.client.log( `Request creation failed: "${error}"`, interaction );

        if ( !interaction.replied )
            await interaction.editReply( `Unable to play request. ${error}.` );
        return;
    }//end try-catch

    //add to queue
    //if queue length is 1, play 
    //reply

    return;
}//end function play