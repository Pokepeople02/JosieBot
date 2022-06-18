'use strict';

import {
	unpauseNotPausedReply,
	unpauseSuccessfulReply,
} from '../messages.js';
import { Status } from '../bot-status.js';
	
/** Attempts to unpause the current request for the specified guild. */
export async function unpause( interaction, guildSub ) {
	
	//If not paused, print message and stop
	if( guildSub.getStatus() !== Status.Paused ) {
		console.log( 'Unpause failed: Not paused.' );
		await interaction.editReply( unpauseNotPausedReply() );
		return;
	}//end if
	
	await guildSub.resume();
	
	console.log( 'Unpause successful' );
	await interaction.editReply( unpauseSuccessfulReply(guildSub.getQueue()[0]) );
	return;
}//end function unpause