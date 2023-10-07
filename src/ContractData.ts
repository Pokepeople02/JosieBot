import { Snowflake } from "discord.js";

/** POD class for GuildContact data which is saved to file between sessions */
export class ContractData {
    public readonly guildId: Snowflake;
    public readonly homeId: Snowflake | null;

    constructor( guildId: Snowflake, homeId: Snowflake | null ) {
        this.guildId = guildId;
        this.homeId = homeId;
    }//end constructor

}//end class GuildData