import { Snowflake } from "discord.js";
import { validate } from "play-dl";
import { BadRequestError } from "../errors/BadRequestError";
import { TimeoutError } from "../errors/TimeoutError";
import { Request } from "./Request";
import { YouTubeVideoRequest } from "./YouTubeVideoRequest";

/**Creates a promise for a new request corresponding to the format of the input provided.
 * Rejects if the input corresponds to a type of request that is not yet supported,
 * or if unable to determine the type of request in a reasonable amount of time.
 * 
 * Errors during request creation and initialization are passed upwards to the calling function.
 * 
 * @param input The input for this request.
 * @param userId The ID of the user who made this request.
 * @param channelId The ID of the channel this request will play in.
 * @return A promise that, if resolves, returns a Request of a type appropriate for the given input. 
 * See documentation for each individual request type for its returned errors upon rejection.
 * 
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
        setTimeout( () => { reject( new TimeoutError( "Request creation timed out" ) ); }, globalThis.timeLimit );

        try { type = await validate( cleanInput ); }
        catch ( error ) { reject( new BadRequestError( `Unable to determine type of request: ${error}`, "unknown" ) ); }

        try {

            switch ( type ) {
                case "yt_video":
                    request = new YouTubeVideoRequest( input, userId, channelId );
                    await request.init();
                    resolve( request );
                case false:
                    reject( new BadRequestError( "Request is of invalid type", "invalid" ) );
                default:
                    reject( new BadRequestError( `Request of unsupported type "${type}"`, "unsupported" ) );
            }//end switch

        } catch ( error ) {
            reject( error );
        }//end try-catch

    } );

}//end function createRequest