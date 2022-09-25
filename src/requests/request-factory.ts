import { Snowflake } from "discord.js";
import { validate } from "play-dl";
import { Request } from "./request";
import { YouTubeVideoRequest } from "./yt-video";

/**Creates a promise for a new request corresponding to the format of the input provided.
 * Rejects if the input corresponds to a type of request that is not yet supported,
 * or if unable to determine the type of request in a reasonable amount of time.
 * @param input The input for this request.
 * @param userId The ID of the user who made this request.
 * @param channelId The ID of the channel this request will play in.
 * @return A promise for a Request of a type appropriate for the given input.
 */
export function createRequest( input: string, userId: Snowflake, channelId: Snowflake ): Promise<Request> {
    const timeLimit = 3000; //A reasonable amount of time here, in milliseconds.
    let cleanInput: string;

    //Clean up YouTube URL bloat that could cause false type
    if ( input.toLowerCase().includes( "youtube.com" ) && input.includes( "&" ) )
        cleanInput = input.substring( 0, input.indexOf( "&" ) );
    else
        cleanInput = input;

    return new Promise<Request>( ( resolve, reject ) => {
        setTimeout( () => { reject( "Unable to determine request type within time limit." ); }, timeLimit );

        validate( cleanInput )
            .then( ( result ) => {
                let requestType: string;

                try {
                    switch ( result ) {
                        case "yt_video":
                            resolve( new YouTubeVideoRequest( input, userId, channelId ) );
                            break;
                        case false:
                            reject( "Unable to determine request type" );
                            break;
                        default:
                            reject( `Requests of type '${result}' are not supported yet.` );
                    }//end switch
                } catch ( error ) {
                    reject( `Failed to create request of type '${result}': ${error}` );
                }//end try-catch
            } )
            .catch( ( reason ) => { reject( `Unable to determine request type: ${reason}` ); } );
    } );

}//end function createRequest