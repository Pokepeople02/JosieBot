'use strict';

const { SlashCommandBuilder } = require( '@discordjs/builders' );

/* JSON data for the /queue command, built with discord.js' SlashCommandBuilder. */
module.exports.data = new SlashCommandBuilder()
	.setName( 'queue' )
	.setDescription( 'Replies with a message displaying the upcoming requests in the queue.' );

/* Prints the current queue of the supplied guild subscription. */
module.exports.queue = async function queue( interaction, guildSub ) {
	const queue = guildSub.getQueue(); //Queue of the supplied guild
	let queueString = ""; //String representation of the queue
	
	console.log( 'Printing the queue' );
	
	if( queue.length === 0 ) {
		console.log( 'The queue is currently empty.\n' );
		interaction.editReply( 'The queue is currently empty! Please add a request.' );
		
		return;
	};
	
	queueString += 'Current queue:';
	let i = 1; //Iterator for queue request indices
	for( const entry of queue ) {
		const title = await entry.getTitle();
		
		queueString += '\n'; //Newline
		queueString += `${i.toString().padStart(2, '0')}. `; //Index
		queueString += (`"${title.substring(0, title.length > 50 ? 47 : title.length - 3) + ( title.length > 50 ? '...' : title.substring(title.length - 3, title.length) )}"`).padEnd(52, ' ') + '\t'; //Request title
		queueString += `Channel: ${entry.getChannel().name}` //Request channel
		
		i++;
	}//end for
	
	console.log( queueString );
	interaction.editReply( queueString );
	
	return;
}//end function queue