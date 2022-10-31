import { ChatInputCommandInteraction, Guild, GuildBasedChannel, InteractionReplyOptions } from "discord.js";
import { NonTextChannelError } from "../../errors/NonTextChannelError";
import { UnresolvedChannelError } from "../../errors/UnresolvedChannelError";


/**Sets the home channel, where bot status messages are sent, for a guild.
 * @param {ChatInputCommandInteraction} interaction The prompting command interaction, used for logging purposes.
 * @param {GuildBasedChannel} channel The guild channel to be set as the new home channel.
 * @throws {@link UnresolvedChannelError} When the provided channel cannot be found as a valid channel in a known guild.
 * @throws {@link NonTextChannelError} When the provided channel is not a text-based channel.
 */
export function setHomeChannel( interaction: ChatInputCommandInteraction<"cached">, channel: GuildBasedChannel ): void {
    const contract = globalThis.client.contracts.get( interaction.guildId )!;

    try {
        contract.homeId = channel.id;
    } catch ( error ) {
        globalThis.client.log( `Failed to set home -- ${error}`, contract.guildId );

        throw error;
    }//end try-catch

    globalThis.client.log( `Home channel set to "${channel.name}"`, contract.guildId );

    return;
}//end function setHomeChannel

/**Resets the stored home channel, where bot status messages are sent, for a guild.
* @param interaction The prompting command interaction.
 */
export function clearHomeChannel( interaction: ChatInputCommandInteraction<"cached"> ) {
    const contract = globalThis.client.contracts.get( interaction.guildId )!;

    contract.homeId = null;

    globalThis.client.log( "Home channel cleared", contract.guildId );

    return;
}//end function clearHomeChannel