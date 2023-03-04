import { ApplicationCommand, ChatInputCommandInteraction, Collection, SlashCommandBuilder, Snowflake, VoiceBasedChannel } from "discord.js";
import { Command } from "../../Command";
import { Mode } from "../../Mode";
import { Request } from "../../requests/Request";

let Skip: Command = {

    data: new SlashCommandBuilder()
        .setName( "skip" )
        .setDescription( "Skips to the next request." )
        .toJSON(),

    async execute( interaction: ChatInputCommandInteraction<"cached"> ): Promise<void> {
        const contract = globalThis.client.contracts.get( interaction.guildId )!;
        const commands: Collection<Snowflake, ApplicationCommand> = await globalThis.client.application!.commands.fetch();
        const playId: Snowflake = commands.filter( command => command.name === "play" ).first()!.id;
        const playChannelId: Snowflake = commands.filter( command => command.name === "play-channel" ).first()!.id;
        const playUserId: Snowflake = commands.filter( command => command.name === "play-user" ).first()!.id;
        let skipped: Request | null = contract.currentRequest;
        let channel: VoiceBasedChannel | null = globalThis.client.guilds.resolve( contract.guildId )!.members.me!.voice.channel;

        if ( contract.currentMode === Mode.Waiting || contract.currentMode === Mode.Idle ) {

            await interaction.reply( {
                embeds: [{
                    title: "❌  Unable to Skip",
                    description: "There's nothing in the queue! Start playing with " +
                        `</play:${playId}>, </play-user:${playUserId}>, or </play-channel:${playChannelId}> first.`
                }],
            } );

            return;
        };//end if

        skipped = contract.currentRequest;
        contract.skip( 1 );

        await interaction.reply( {
            embeds: [{
                title: "✅  Skipped a Request",
                description: `Successfully skipped [${skipped!.title}](${skipped!.resourceUrl!}) in ${channel!.toString()}.`
            }],
        } );

    }//end method execute

};

export { Skip };