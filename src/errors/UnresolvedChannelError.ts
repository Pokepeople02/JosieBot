
/**An error ocurring when a provided Discord channel ID does not resolve to a valid channel. */
export class UnresolvedChannelError extends Error {

    /**Creates a new UnresolvedChannelError for when a Discord channel ID does not resolve to a valid channel.
     * @param message The error message.
     */
    constructor( message: string ) {
        super( message );
    }//end constructor

}//end class UnresolvedChannelError