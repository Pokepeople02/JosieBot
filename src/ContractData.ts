import { Snowflake } from "discord.js";

/** POD class for GuildContact data which is saved to file between sessions */
export class ContractData {
    public readonly guildId: Snowflake;
    public readonly homeChannelId: Snowflake | null;

    constructor( guildId: Snowflake, homeChannelId: Snowflake | null ) {
        this.guildId = guildId;
        this.homeChannelId = homeChannelId;
    }//end constructor

}//end class GuildData