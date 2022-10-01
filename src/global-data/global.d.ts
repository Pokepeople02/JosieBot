import { IsabelleClient } from "../isabelle-client";

declare global {
    /**The global discord.js client. */
    var client: IsabelleClient;
    /** A "reasonable amount of time", in milliseconds. Used for promise rejection timeouts.*/
    var timeLimit: number;
}//end declaration global