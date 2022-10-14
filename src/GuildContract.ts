import { Snowflake } from "discord.js";
import { NonTextChannelError } from "./errors/NonTextChannelError";
import { UnresolvedChannelError } from "./errors/UnresolvedChannelError";

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

    /**If set to a snowflake, throws TypeError when set if unable to resolve it to a Channel object or if resolves into a non-text-based channel.
     * @throws `UnresolvedChannelError` When the given ID is not null, but does not resolve to a known channel.
     * @throws `NonTextChannelError` When the given ID is not null, but does not correspond to a text-based channel.
     */
    public set homeId( homeId: Snowflake | null ) {
        let channel;

        if ( homeId ) {
            channel = globalThis.client.channels.resolve( homeId );

            if ( !channel )
                throw new UnresolvedChannelError( `Home ID is not resolvable (ID: ${homeId})` );
            else if ( !channel.isTextBased() )
                throw new NonTextChannelError( `"${channel.name!}" is not text-based` );

        }//end if

        this._homeId = homeId;

        //TODO: Send 'Now Playing'
    }//end setter homeId

}//end class GuildContract