const { SlashCommandBuilder } = require( '@discordjs/builders' );

module.exports.data = new SlashCommandBuilder()
	.setName( 'queue' )
	.setDescription( 'Replies with a message displaying the upcoming requests in the queue.' );

module.exports.queue = async function queue( interaction ) {
	const guildSub = globalThis.subMap.get( interaction.guildId ); //GuildSubscription object for current guild.
	const guildQueue = guildSub.queue //Guild queue object
	let queueString = ""; //String representation of the queue
	
	console.log( 'Printing the queue' );
	
	if( guildQueue.length === 0 ) {
		console.log( 'The queue is currently empty.\n' );
		queueString += 'The queue is currently empty! Please add a request.';
	} else {
		queueString += 'Current queue:\n'
		
		let iterator = 1; //Numeric iterator for queue request indices
		for( const entry of guildQueue ) {
			const title = (await entry.info).videoDetails.title;
			
			queueString += `${iterator.toString().padStart(2, '0')}. `; //Index
			queueString += (`"${title.substring(0, title.length > 50 ? 47 : title.length - 3) + ( title.length > 50 ? '...' : title.substring(title.length - 3, title.length) )}"`).padEnd(52, ' ') + '\t'; //Request title
			queueString += `Channel: ${entry.channel.name}` //Request channel
			queueString += '\n'; //Newline
			
			iterator++;
		}//end for
		
		console.log( queueString + '\n' );
	}//end if-else
	
	interaction.editReply( queueString );
	return;
}//end function queue