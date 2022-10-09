
/**An error occurring when a non-text-based channel was provided where a text-based one was expected. */
export class NonTextChannelError extends TypeError {

    /**Creates a new NonTextChannelError for when a non-text channel was unexpectedly provided.
     * @param message The error message.
     */
    constructor( message: string ) {
        super( message );
    }//end constructor

}//end class NonTextChannelError