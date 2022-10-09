import { Snowflake } from "discord.js";

/**An error ocurring when a provided Discord user ID does not resolve to a valid user. */
export class UnresolvedUserError extends Error {

    /**The unresolved user ID. */
    readonly id: Snowflake;

    /**Creates a new UnresolvedUserError for when a Discord user ID does not resolve to a valid user.
     * @param message The error message.
     * @param id The unresolvable ID.
     */
    constructor( message: string, id: Snowflake ) {
        super( message );

        this.id = id;
    }//end constructor

}//end class UnresolvedUserError