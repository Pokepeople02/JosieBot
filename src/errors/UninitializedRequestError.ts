
/**An error ocurring when a request is used before it is set as ready. */
export class UninitializedRequestError extends Error {

    /**Creates a new UninitializedRequestError for when a request is used before it is set as ready.
     * @param message The error message.
     */
    constructor( message: string ) {
        super( message );
    }//end constructor

}//end class UninitializedRequestError