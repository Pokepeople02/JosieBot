
/**An error ocurring when a provided Discord guild ID does not resolve to a valid guild. */
export class UnresolvedGuildError extends Error {

    /**Creates a new UnresolvedGuildError for when a Discord guild ID does not resolve to a valid guild.
     * @param message The error message.
     */
    constructor( message: string ) {
        super( message );
    }//end constructor

}//end class UnresolvedGuildError