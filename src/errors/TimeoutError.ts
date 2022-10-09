
/**An error occurring when a promise times out and is assumed failed or stuck. */
export class TimeoutError extends Error {

    /**Creates a new TimeoutError for when a promise times out without resolving.
     * @param message The error message.
     */
    constructor( message: string ) {
        super( message );
    }//end constructor

}//end class TimeoutError