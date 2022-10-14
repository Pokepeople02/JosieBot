
/**An error occurring when an untenable request is made.*/
export class BadRequestError extends TypeError {

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

    /**Creates a new BadRequestError for an erroneous request.
     * @param message The error message.
     * @param type The particular way in which the erroneous request is problematic.
     */
    constructor( message: string, type: "invalid" | "unknown" | "unsupported" ) {
        super( message );

        this.type = type;
    }//end constructor

}//end class InvalidRequestError