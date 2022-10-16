import { ChatInputCommandInteraction, GuildBasedChannel, InteractionReplyOptions } from "discord.js";
import { NonTextChannelError } from "../../errors/NonTextChannelError";
import { UnresolvedChannelError } from "../../errors/UnresolvedChannelError";


/**Sets the home channel, where bot status messages are sent, for a guild.
 * @param {ChatInputCommandInteraction} interaction The prompting command interaction.
 * @param {GuildBasedChannel} channel The guild channel to be set as the new home channel.
 */
export function setHomeChannel( interaction: ChatInputCommandInteraction, channel: GuildBasedChannel ): void {
    const contract = globalThis.client.contracts.get( interaction.guildId! )!;
    const currHome = contract.homeId ? globalThis.client.channels.resolve( contract.homeId ) as GuildBasedChannel : null;

    try {
        contract.homeId = channel.id;
    } catch ( error ) {
        let replyContent: InteractionReplyOptions = { embeds: [] };

        globalThis.client.log( `Failed to set home -- ${error}`, interaction );

        if ( error instanceof UnresolvedChannelError ) {
            replyContent.embeds = [{
                title: "❌  Unable to Set Home Channel",
                description: `The provided channel cannot be found. Please choose a different channel.` +
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

        interaction.reply( replyContent );

        return;
    }//end try-catch

    globalThis.client.log( `Home channel set to "${channel.name}"`, interaction );

    interaction.reply( {
        embeds: [{
            title: "✅  Home Channel Set",
            description: `Successfully updated the home channel to ${channel}.`
        }],
    } );

    return;
}//end function setHomeChannel

/**Resets the stored home channel, where bot status messages are sent, for a guild.
* @param interaction The prompting command interaction.
 */
export function clearHomeChannel( interaction: ChatInputCommandInteraction ) {
    const contract = globalThis.client.contracts.get( interaction.guildId! )!;

    contract.homeId = null;

    globalThis.client.log( "Home channel cleared", interaction );

    interaction.reply( {
        embeds: [{
            title: "✅  Home Channel Cleared",
            description: "Successfully cleared the home channel."
        }],
    } );

    return;
}//end function clearHomeChannel