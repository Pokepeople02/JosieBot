import { AudioPlayer } from "@discordjs/voice";
import { Snowflake } from "discord.js";

export interface Request {

    /**The string provided when the request was made. */
    input: string;
    /**The ID of the channel in which the request is to be played. */
    channelId: Snowflake;
    /**The ID of the user who made the request. */
    userId: Snowflake;
    /**The total length or duration of the resource associated with the request. Undefined until request is ready. */
    length: number | undefined;
    /**The duration into the request to begin playing. */
    start: number;
    /**The duration into the request to stop playing. */
    end: number;
    /**The title of the resource associated with the request. Undefined until request is ready. */
    title: string | undefined;
    /**The creator of the resource associated with the request. Undefined until request is ready. */
    creator: string | undefined;
    /**The URL of the resource associated with the request. Undefined until request is ready.*/
    resourceUrl: string | undefined;
    /**The URL of the thumbnail associated with the request. Undefined until request is ready. */
    thumbnailUrl: string | undefined;
    /**Whether or not the request has been properly initialized yet or not. */
    ready: boolean;

    /**Finalizes initialization and marks this request as ready to be used. 
     * Rejects if unable to finalize initialization within a reasonable amount of time.*/
    init(): Promise<void>;

    /**Plays the associated resource with this request on the supplied audio player.
     * Rejects if unable to begin playing within a reasonable amount of time.
     * @param player The Audio Player through which the request should be played.
     */
    play( player: AudioPlayer ): Promise<void>;

    /**Pauses this request if it is currently playing on an Audio Player.
     * Rejects if unable to pause request within a reasonable amount of time.
     */
    pause(): Promise<void>;

    /**Resumes playing on the previous Audio Player if this request is currently paused.
     * Rejects if unable to resume playing within a reasonable amount of time.
     */
    resume(): Promise<void>;

}//end interface Request