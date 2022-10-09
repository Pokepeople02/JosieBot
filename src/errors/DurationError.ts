
/**An error occurring in a request when the start or end properties of the request are invalid or contradictory. */
export class DurationError extends RangeError {

    /**Whether the start property was a source of error for the request. */
    readonly badStart: boolean;
    /**Whether the end property was a source of error for the request. */
    readonly badEnd: boolean;

    /**Creates a new DurationError for an erroneous request with the specified message, start, and end.
     * @param message The error message.
     * @param badStart Whether the start property was a source of error for the request.
     * @param badEnd Whether the end property was a source of error for the request.
     */
    constructor( message: string, badStart: boolean, badEnd: boolean ) {
        super( message );

        this.badStart = badStart;
        this.badEnd = badEnd;
    }//end constructor

}//end class DurationError