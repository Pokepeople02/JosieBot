const { SlashCommandBuilder } = require( '@discordjs/builders' );

module.exports.data = new SlashCommandBuilder()
	.setName( 'skip ' )
	.setDescription( 'Skips the currently playing request.' )
;

module.exports.skip = async function skip( interaction ) {
	const guildSub = globalThis.subMap.get( interaction.guildId ); //GuildSubscription object for current guild.
	
	console.log( 'Skipping the current request.' );
	if( guildSub.queue.length > 0 ) {
		interaction.editReply( 'Skipping the currently playing request.' );
		guildSub.audioPlayer.stop(true); //Triggers bot's transition logic
	} else {
		interaction.editReply( 'Unable to skip: The queue is currently empty.' );
	}//end if-else
	
	return;
}//end function skip