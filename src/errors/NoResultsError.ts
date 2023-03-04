
/**An error occurring when a search request yields no usable results. */
export class NoResultsError extends Error {

    /**Creates a new NoResultsError for when a search request yields no usable results.
     * @param message The error message.
     */
    constructor( message: string ) {
        super( message );
    }//end constructor

}//end class NoResultsError