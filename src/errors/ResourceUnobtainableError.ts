
/**An error occurring when an external resource associated with a request is unreachable. */
export class ResourceUnobtainableError extends URIError {

    /**The particular unreachable external resource.
     * Acceptable values are as follows:
     * 
     * `stream` -- A usable audio stream is unable to be obtained.
     * 
     * `info` -- Necessary information about the request is unable to be obtained.
     */
    readonly resource: "stream" | "info";

    /**Creates a new ResourceUbobtainableError for when an external resource associated with a request is unreachable.
     * @param message The error message.
     * @param resource The particular unreachable external resource.
     */
    constructor( message: string, resource: "stream" | "info" ) {
        super( message );

        this.resource = resource;
    }//end constructor

}//end class ResourceUnobtainableError