import { ChatInputCommandInteraction, Client, GuildChannel, Snowflake, ThreadChannel } from "discord.js";
import { GuildContract } from "./GuildContract";

/** Bot client managing interactions with the Discord API and global behavior across all guilds.
 * @see https://discord.js.org/#/docs/discord.js/main/class/Client
*/
export class IsabelleClient extends Client {

    /**Map of guild IDs to their appropriate contract. */
    readonly contracts = new Map<Snowflake, GuildContract>;

    /**Logs message to console with appropriately tagged info.
     * @param {string} message The message content.
     * @param {ChatInputCommandInteraction} interaction Descriptive tags are synthesized from this Interaction.
     */
    public log( message: string, interaction: ChatInputCommandInteraction ): void;
    /**Logs message to console with appropriately tagged info.
     * @param {string} message The message content.
     * @param {Snowflake} [guildId] Guild ID to attribute the message to. Default tag is "[GLOBAL]".
     * @param {Snowflake} [channelId] Guild channel ID to attribute the message to. Hides tag if undefined.
     * @param {Date} [loggedAt] Timestamp for the logged message. Default tag uses current system time.
     */
    public log( message: string, guildId?: Snowflake, channelId?: Snowflake, loggedAt?: Date ): void;
    log( message: string, interactOrGuildId: ChatInputCommandInteraction | Snowflake = "0", channelId: Snowflake = "0", loggedAt: Date = new Date() ) {
        let guildId: Snowflake;
        let prefix: string;

        if ( interactOrGuildId instanceof ChatInputCommandInteraction ) {
            guildId = interactOrGuildId.guildId!;
            channelId = interactOrGuildId.channelId;
            loggedAt = interactOrGuildId.createdAt;
        } else {
            guildId = interactOrGuildId;
        }//end if-else

        prefix = `[${loggedAt.toString()}]`;

        if ( guildId === "0" )
            prefix += " [GLOBAL]";
        else if ( !this.guilds.resolve( guildId ) )
            prefix += " [UNKNOWN]";
        else {
            prefix += ` [${this.guilds.resolve( guildId )!.name}`;

            if ( channelId === "0" )
                prefix += "]";
            else if ( !this.channels.resolve( channelId ) )
                prefix += "/UNKNOWN]";
            else
                prefix += `/${( this.channels.resolve( channelId )! as GuildChannel | ThreadChannel ).name}]`;

        }//end else

        console.log( prefix + " " + message );

        return;
    }//end method log

}//end class IsabelleClient
