'use strict';

import {
	queueEmptyReply,
	queuePrintReply,
} from '../messages.js';

/** Prints the current queue of the supplied guild subscription. */
export async function queue( interaction, guildSub ) {
	const queue = guildSub.getQueue(); //Queue of the supplied guild
	
	console.log( 'Printing the queue' );
	
	if( queue.length === 0 ) {
		console.log( 'The queue is currently empty.\n' );
		interaction.editReply( queueEmptyReply() );
		return;
	}//end if
	
	await interaction.editReply( await queuePrintReply(guildSub) );
	return;
}//end function queue