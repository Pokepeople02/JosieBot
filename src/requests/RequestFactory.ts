import { Snowflake } from "discord.js";
import { validate } from "play-dl";
import { BadRequestError } from "../errors/BadRequestError";
import { TimeoutError } from "../errors/TimeoutError";
import { ResourceUnobtainableError } from "../errors/ResourceUnobtainableError";
import { DurationError } from "../errors/DurationError";
import { NonVoiceChannelError } from "../errors/NonVoiceChannelError";
import { UnresolvedChannelError } from "../errors/UnresolvedChannelError";
import { UnresolvedUserError } from "../errors/UnresolvedUserError";
import { Request } from "./Request";
import { YouTubeVideoRequest } from "./YouTubeVideoRequest";

/**Creates a promise for a new request corresponding to the format of the input provided.
 * Errors during request creation and initialization are passed upwards to the calling function. See throws.
 * @param {string} input The input for this request.
 * @param {Snowflake} userId The ID of the user who made this request.
 * @param {Snowflake} channelId The ID of the channel in which to play this request.
 * @return {Promise<Request>} A promise for a Request of the type appropriate for the given input string. 
 * @throws {@link UnresolvedUserError} When constructing a YouTubeVideoRequest. See linked documentation for more details.
 * @throws {@link DurationError} When constructing a YouTubeVideoRequest. See linked documentation for more details.
 * @throws {@link UnresolvedChannelError} When constructing a YouTubeVideoRequest. See linked documentation for more details.
 * @throws {@link NonVoiceChannelError} When constructing a YouTubeVideoRequest. See linked documentation for more details.
 * @throws {@link TimeoutError} When initializing a YouTubeVideoRequest. See linked documentation for more details.
 * @throws {@link ResourceUnobtainableError} When initializing a YouTubeVideoRequest. See linked documentation for more details.
 * @see {@link YouTubeVideoRequest} For errors that may occur during YouTubeVideoRequest construction, and their exact circumstances.
 * @see {@link YouTubeVideoRequest.init} For errors that may occur during YouTubeVideoRequest initialization, and their exact circumstances.
 */
export async function createRequest( input: string, userId: Snowflake, channelId: Snowflake ): Promise<Request> {
    let cleanInput: string;
    let type: Awaited<ReturnType<typeof validate>>;
    let request: Request;

    setTimeout( () => { throw new TimeoutError( "Request creation timed out" ); }, globalThis.timeLimit );

    //Clean up YouTube URL bloat that could cause false type
    if ( input.toLowerCase().includes( "youtube.com" ) && input.includes( "&" ) )
        cleanInput = input.substring( 0, input.indexOf( "&" ) );
    else
        cleanInput = input;

    try { type = await validate( cleanInput ); }
    catch ( error ) { throw new BadRequestError( `Unable to determine type of request: ${error}`, "unknown" ); }

    //Passes errors up
    switch ( type ) {
        case "yt_video":
            request = new YouTubeVideoRequest( input, userId, channelId );
            await request.init();
            break;
        case false:
            throw new BadRequestError( "Request is of invalid type", "invalid" );
        default:
            throw new BadRequestError( `Request of unsupported type "${type}"`, "unsupported" );
    }//end switch

    return request;
}//end function createRequest