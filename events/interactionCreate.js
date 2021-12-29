
module.exports = {
    name: 'interactionCreate',
    once: false,
    execute(interaction) {
        console.log(`\n${interaction.createdAt}: ${interaction.user.tag} triggered an interaction in guild '${interaction.guild.name}', channel '#${interaction.channel.name}'.`);
    },
};