
/**An error occurring in a request when the start or end properties of the request are invalid or contradictory. */
export class DurationError extends RangeError {

    /**Creates a new DurationError for an erroneous request with the specified message, start, and end.
     * @param message The error message.
     */
    constructor( message: string ) {
        super( message );

    }//end constructor

}//end class DurationError