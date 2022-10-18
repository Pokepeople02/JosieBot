
/**Enumeration of states the bot take during operation. */
export enum Status {
    /**Bot is playing a request to a populated voice channel. */
    Playing = "Playing",
    /**Bot was playing a request to a populated voice channel, but has been instructed to pause. */
    Paused = "Paused",
    /**Bot is connected to a populated voice channel, but has recently exhausted the queue.*/
    Waiting = "Waiting",
    /**Bot is in an unpopulated voice channel. */
    Standby = "Standby",
    /**Bot is disconnected from voice and the queue is empty. */
    Idle = "Idle",
}//end enum Status