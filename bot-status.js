'use strict';

/**	Enum-like class to enumerate possible bot statuses. */
export class Status {

	/** Bot is currently playing in an audio channel. */
	static Playing = Symbol( "Playing" );

	/** Bot is not in use and is disconnected. */
	static Idle = Symbol( "Idle" );

	/** Bot was in use and is still connected, but has now exhausted the queue. */
	static Waiting = Symbol( "Waiting" );

	/** Bot was in use and still playing, but all other users have left the voice channel. */
	static Standby = Symbol( "Standby" );

	/** Bot was in use and still playing, but has been paused with /pause. */
	static Paused =		Symbol( "Paused" );	
	
}//end class Status