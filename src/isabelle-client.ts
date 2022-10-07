import { ChatInputCommandInteraction, Client, ClientOptions, Collection, GuildChannel, Snowflake, ThreadChannel } from "discord.js";
import { GuildContract } from "./guild-contract";

/** Manages global bot behavior and interaction with the Discord API across all servers. */
export class IsabelleClient extends Client {

    /**Map of guild ID snowflakes to their appropriate contract. */
    readonly contracts = new Map<string, GuildContract>;

    /**Logs a message to the console with a timestamp.
     * @param message The content of the message to be logged.
     * @param interaction The interaction associated with this logged message.
     */
    public log( message: string, interaction: ChatInputCommandInteraction ): void;
    /**Logs a message to the console with a timestamp.
     * @param message The content of the message to be logged.
     * @param guildId The snowflake ID of the guild to attribute the message to. Default attributes to "GLOBAL".
     * @param channelId The snowflake ID of the guild channel to attribute the message to. Defaults to none.
     * @param loggedAt The date/time to print with the logged message. Defaults to the current time.
     */
    public log( message: string, guildId?: Snowflake, channelId?: Snowflake, loggedAt?: Date ): void;
    public log( message: string, interactOrGuildId: ChatInputCommandInteraction | Snowflake = "0", channelId: Snowflake = "0", loggedAt: Date = new Date() ) {
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
