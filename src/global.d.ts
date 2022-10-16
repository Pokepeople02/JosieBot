import { IsabelleClient } from "./IsabelleClient";

declare global {

    /**The discord.js client.
     * @global
     */
    var client: IsabelleClient;

    /** A "reasonable amount of time", in milliseconds. Used for promise rejection timeouts.
     * @global
     */
    var timeLimit: number;

}//end declaration global