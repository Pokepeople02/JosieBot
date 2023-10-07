
/**An error occurring when persistently written data did not match the expected format when re-read. */
export class DataMismatchError extends Error {

    /**Creates a new DataMismatchError for when data did not match the expected format.
     * @param message The error message.
     */
    constructor( message: string ) {
        super( message );
    }//end constructor

}//end class DataMismatchError