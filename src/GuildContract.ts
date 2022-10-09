import { Snowflake } from "discord.js";
import { IsabelleClient } from "./IsabelleClient";

/**Represents the contract between bot and guild the bot operates in. 
 * Stores information about their relationship and carries out core bot activities.
 */
export class GuildContract {

    /**The identifier of the guild associated with this contract. */
    readonly guildId: Snowflake;

    /**The identifier of the home channel within this contract's guild. Null when not set. */
    private _homeId: Snowflake | null;

    constructor( guildId: Snowflake ) {
        this.guildId = guildId;
        this._homeId = null;
    }//end constructor

    /**The identifier for the home channel of the associated guild. Defaults to null. */
    public get homeId(): Snowflake | null {
        return this._homeId;
    }//end getter homeId

    /**If set to a snowflake, throws TypeError when set if unable to resolve it to a Channel object or if resolves into a non-text-based channel. */
    public set homeId( homeId: Snowflake | null ) {
        let channel;

        if ( homeId ) {
            channel = globalThis.client.channels.resolve( homeId );

            if ( !channel )
                throw new TypeError( `"${homeId}" is not resolvable to a channel.` );
            else if ( !channel.isTextBased() )
                throw new TypeError( `"${channel.name!}" is not a text-based channel.` );

        }//end if

        this._homeId = homeId;

        //TODO: Send 'Now Playing'
    }//end setter homeId

}//end class GuildContract