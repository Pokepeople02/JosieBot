import { Snowflake } from "discord.js";

/**An error ocurring when a provided Discord channel ID does not resolve to a valid channel. */
export class UnresolvedChannelError extends Error {

    /**The unresolved channel ID. */
    readonly id: Snowflake;

    /**Creates a new UnresolvedChannelError for when a Discord channel ID does not resolve to a valid channel.
     * @param message The error message.
     * @param id The unresolvable ID.
     */
    constructor( message: string, id: Snowflake ) {
        super( message );

        this.id = id;
    }//end constructor

}//end class UnresolvedChannelError