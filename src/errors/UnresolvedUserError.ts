
/**An error ocurring when a provided Discord user ID does not resolve to a valid user. */
export class UnresolvedUserError extends Error {

    /**Creates a new UnresolvedUserError for when a Discord user ID does not resolve to a valid user.
     * @param message The error message.
     */
    constructor( message: string ) {
        super( message );
    }//end constructor

}//end class UnresolvedUserError