import { AudioPlayer } from "@discordjs/voice";
import { Snowflake } from "discord.js";
import { YouTubeVideoRequest } from "./YouTubeVideoRequest";

/**The template for a valid request.
 * @interface
 */
export interface Request {

    /**The input to build this request from. */
    input: string;
    /**The ID of the channel in which to play this request. */
    channelId: Snowflake;
    /**The ID of the user who made this request. */
    userId: Snowflake;
    /**The total duration of this request's underlying resource. Undefined until request is ready. */
    length: number | undefined;
    /**The duration into this request to begin playing. */
    start: number;
    /**The duration into this request to stop playing. */
    end: number;
    /**The title of this request. Undefined until request is ready. */
    title: string | undefined;
    /**The attributed creator of this request's underlying resource. Undefined until request is ready. */
    creator: string | undefined;
    /**The URL of this request's underlying resource. Undefined until request is ready.*/
    resourceUrl: string | undefined;
    /**The URL of the thumbnail of this request's underlying resource. Undefined until request is ready. */
    thumbnailUrl: string | undefined;
    /**Whether this request is currently considered usable. */
    ready: boolean;
    /**Whether this request has begun playback yet or not. */
    started: boolean;

    /**Initializes asynchronously-filled properties and marks this request as ready to be used. 
     * @see {@link YouTubeVideoRequest.init} and other concrete implementing classes for exact errors thrown.
     * @async
     */
    init(): Promise<void>;

    /**Plays the associated resource with this request on the supplied audio player.
     * @param {AudioPlayer} player The Audio Player through which the request should be played.
     * @see https://discord.js.org/#/docs/voice/main/class/AudioPlayer
     * @async
     */
    play( player: AudioPlayer ): Promise<void>;

    /**Pauses this request if it is currently playing.
     * @async
     */
    pause(): Promise<void>;

    /**If this request is paused, resumes playing on the previously used Audio Player.
     * @async
     */
    resume(): Promise<void>;

}//end interface Request