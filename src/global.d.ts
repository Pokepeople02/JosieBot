import { IsabelleClient } from "./IsabelleClient";

declare global {

    /**The discord.js client.
     * @global
     */
    var client: IsabelleClient;

    /** A "reasonable amount of time", in milliseconds, to use for promise rejection timeouts.
     * @global
     */
    var promiseTimeout: number;

    /**An amount of time, in miliseconds, to use for bot `Waiting` mode timeouts.
     * @global
     */
    var waitingTimeout: number;

    /**An amount of time, in miliseconds, to use for bot `Standby` mode timeouts.
     * @global
     */
    var standbyTimeout: number;

    /**The root directory path, as determined by the path to the directory above that containing Index.
     * @global
     */
    var rootPath: string;

    /**The directory containing guild contract data which is persistent between sessions.
     * @global
      */
    var dataDirectory: string;

}//end declaration global