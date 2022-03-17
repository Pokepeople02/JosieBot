'use strict';

/*	Enum-like class to enumerate possible bot statuses. */
export class Status {
	
	static Playing =	Symbol( "Playing" );	//Bot is currently playing in an audio channel.
	static Idle = 		Symbol( "Idle" ); 		//Bot is not in use and is disconnected. 
	static Waiting = 	Symbol( "Waiting" );	//Bot was in use and is still connected, but has now exhausted the queue.
	static Standby =	Symbol( "Standby" );	//Bot was in use and still playing, but all other users have left the voice channel.
	
}//end class Status