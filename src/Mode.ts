
/**Enumeration of states the bot take during operation. */
export enum Mode {
    /**Bot is playing a request to a populated voice channel. */
    Playing = "Playing",
    /**Bot was playing a request to a populated voice channel, but has been instructed to pause. */
    Paused = "Paused",
    /**Bot is connected to a populated voice channel, but has recently exhausted the queue.
     * After a certain amount of time without any new requests, transitions into Idle mode.
    */
    Waiting = "Waiting",
    /**Bot is in an unpopulated voice channel.
     * After a certain amount of time without any listening users, transitions into Idle mode.
     */
    Standby = "Standby",
    /**Bot is disconnected from voice channels and the queue is empty. */
    Idle = "Idle",
}//end enum Mode