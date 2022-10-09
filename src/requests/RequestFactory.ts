import { Snowflake } from "discord.js";
import { validate } from "play-dl";
import { Request } from "./Request";
import { YouTubeVideoRequest } from "./YouTubeVideoRequest";

/**Creates a promise for a new request corresponding to the format of the input provided.
 * Rejects if the input corresponds to a type of request that is not yet supported,
 * or if unable to determine the type of request in a reasonable amount of time.
 * @param input The input for this request.
 * @param userId The ID of the user who made this request.
 * @param channelId The ID of the channel this request will play in.
 * @return A promise for a Request of a type appropriate for the given input.
 */
export async function createRequest( input: string, userId: Snowflake, channelId: Snowflake ): Promise<Request> {
    let cleanInput: string;
    let type: Awaited<ReturnType<typeof validate>>;
    let request: Request;

    //Clean up YouTube URL bloat that could cause false type
    if ( input.toLowerCase().includes( "youtube.com" ) && input.includes( "&" ) )
        cleanInput = input.substring( 0, input.indexOf( "&" ) );
    else
        cleanInput = input;

    return new Promise<Request>( async ( resolve, reject ) => {
        setTimeout( () => { reject( "Unable to determine type of request in a reasonable amount of time" ); }, globalThis.timeLimit );

        try { type = await validate( cleanInput ); }
        catch ( error ) { reject( `Unable to determine request type. ${error}` ); }

        try {

            switch ( type ) {
                case "yt_video":
                    request = new YouTubeVideoRequest( input, userId, channelId );
                    await request.init();
                    resolve( request );
                case false:
                    reject( "Unable to determine type of request" );
                default:
                    reject( `Requests of type '${type}' are not yet supported` );
            }//end switch

        } catch ( error ) {
            reject( error );
        }//end try-catch

    } );

}//end function createRequest