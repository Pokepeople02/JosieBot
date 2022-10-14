
/**An error occurring when an external resource associated with a request is unreachable. */
export class ResourceUnobtainableError extends URIError {

    /**Creates a new ResourceUbobtainableError for when an external resource associated with a request is unreachable.
     * @param message The error message.
     */
    constructor( message: string ) {
        super( message );
    }//end constructor

}//end class ResourceUnobtainableError