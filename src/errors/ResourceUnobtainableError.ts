
/**An error occurring when an external resource associated with a request is unreachable. */
export class ResourceUnobtainableError extends URIError {

    /**Information on how the related resource could not be obtained.
     * Has the following values:
     * 
     * "ageRestrictedNoCookies" - Unable to retreive an age-restricted YouTube video due to inability to sign into YouTube.
     * 
     * "ageRestrictedCookies" - Unable to retreive an age-restricted YouTube video due to cookies for a YouTube account below age 18.
     * 
     * "upcomingOrPremiere" - Unable to get YouTube video stream as video is still upcoming. Upcoming videos still return info.
     * 
     * "unknown" - No information is available.
     * 
     */
    public readonly type: "ageRestrictedNoCookies" | "ageRestrictedCookies" | "upcomingOrPremiere" | "unknown";

    /**Creates a new ResourceUbobtainableError for when an external resource associated with a request is unreachable.
     * @param message The error message.
     */
    constructor( message: string ) {
        super( message );

        //Determine nature of the error from play-dl's YouTube error string.
        if ( message.includes( "Sign in to confirm your age" ) ) {
            this.type = "ageRestrictedNoCookies";
        } else if ( message.includes( "Upcoming and premiere videos that are not currently live cannot be streamed" ) ) {
            this.type = "upcomingOrPremiere";
        } else {
            this.type = "unknown";
        }//end if-else

    }//end constructor

}//end class ResourceUnobtainableError