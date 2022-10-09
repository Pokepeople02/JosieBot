
/**An error occurring when a request with an erroneous or unknown type is made.*/
export class RequestTypeError extends TypeError {

    /**The particular way in which the erroneous request's type is problematic.
     * Acceptable values are as follows:
     * 
     *  `invalid` -- The original request was entirely invalid.
     * 
     *  `unknown` -- The original request's type could not be identified.
     * 
     *  `unsupported` -- The original request was a recognized type for which playback is not supported.
     */
    readonly type: "invalid" | "unknown" | "unsupported";

    /**Creates a new RequestTypeError for a request with an erroneous type.
     * @param message The error message.
     * @param type The particular way in which the erroneous request's type is problematic.
     */
    constructor( message: string, type: "invalid" | "unknown" | "unsupported" ) {
        super( message );

        this.type = type;
    }//end constructor

}//end class InvalidRequestError