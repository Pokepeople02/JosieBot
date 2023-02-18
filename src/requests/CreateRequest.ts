
import { validate } from "play-dl";
import { BadRequestError } from "../errors/BadRequestError";
import { NonVoiceChannelError } from "../errors/NonVoiceChannelError";
import { UnresolvedChannelError } from "../errors/UnresolvedChannelError";
import { UnresolvedUserError } from "../errors/UnresolvedUserError";
import { TimeoutError } from "../errors/TimeoutError";
import { ResourceUnobtainableError } from "../errors/ResourceUnobtainableError";
import { Request } from "./Request";
import { YouTubeVideoRequest } from "./YouTubeVideoRequest";
import { Snowflake } from "discord.js";

/**Creates a promise for a new request corresponding to the format of the input provided.
 * Errors during request creation and initialization are passed upwards to the calling function. See throws.
 * @param {string} input The input for this request.
 * @param {Snowflake} userId The ID of the user who made this request.
 * @param {Snowflake} channelId The ID of the channel in which to play this request.
 * @return {Promise<Request>} A promise for a Request of the type appropriate for the given input string.
 * 
 * For requests of any type: 
 * @throws {@link BadRequestError} When the type of request wanted is invalid, unsupported, or unable to be determined.
 * @throws {@link UnresolvedUserError} When the requesting user's ID is unable to be resolved.
 * @throws {@link DurationError} When the `start` or `end` durations are not in a valid range for that request.
 * @throws {@link UnresolvedChannelError} When the target channel ID is unable to be resolved.
 * @throws {@link NonVoiceChannelError} When the target channel ID resolves to a non-voice channel.
 * 
 * For YouTube video and live stream requests:
 * @throws {@link TimeoutError} When retreiving request info from YouTube takes too long to fulfill.
 * @throws {@link ResourceUnobtainableError} When an error occurs while retreiving request info from YouTube.
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

    try {
        type = await Promise.race( [validate( cleanInput ), new Promise( ( _resolve, reject ) => {
            setTimeout( () => { reject( new TimeoutError( "Request validation timed out" ) ); }, globalThis.promiseTimeout );
        } )] ) as Awaited<ReturnType<typeof validate>>;
    } catch ( error ) {
        throw new BadRequestError( `Unable to determine type of request: ${error}`, "unknown" );
    }//end try-catch

    //Passes errors up
    switch ( type ) {
        case "yt_video":
            request = new YouTubeVideoRequest( input, userId, channelId );

            await Promise.race( [request.init(), new Promise( ( _resolve, reject ) => {
                setTimeout( () => { reject( new TimeoutError( "Request initialization timed out" ) ); }, globalThis.promiseTimeout );
            } )] );

            break;
        case false:
            throw new BadRequestError( "Request is of invalid type", "invalid" );
        default:
            throw new BadRequestError( `Request of unsupported type "${type}"`, "unsupported" );
    };//end switch

    return request;
}//end method createRequest