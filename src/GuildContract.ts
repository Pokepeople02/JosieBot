import { Snowflake } from "discord.js";
import { NonTextChannelError } from "./errors/NonTextChannelError";
import { UnresolvedChannelError } from "./errors/UnresolvedChannelError";
import { UnresolvedGuildError } from "./errors/UnresolvedGuildError";

/**Represents the relationship between bot and guild. Stores information and carries out core bot activities. */
export class GuildContract {

    private _homeId: Snowflake | null = null;

    /**The guild's ID. */
    readonly guildId: Snowflake;

    /**Creates a new contract.
     * @param {Snowflake} guildId The ID of the associated guild.
     */
    constructor( guildId: Snowflake ) {
        if ( !globalThis.client.guilds.resolve( guildId ) )
            throw new UnresolvedGuildError( `Contracted guild ID ${guildId} does not resolve to a valid guild` );

        this.guildId = guildId;
    }//end constructor

    /**Channel ID of the guild's home channel. Defaults to null. */
    public get homeId(): Snowflake | null {
        return this._homeId;
    }//end getter homeId

    /**
     * @throws {@link UnresolvedChannelError} When set to a non-null ID that is unable to be resolved to a known channel.
     * @throws {@link NonTextChannelError} When set to a non-null ID that does not correspond to a text-based channel.
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