import { ApplicationCommand, ChatInputCommandInteraction, Collection, SlashCommandBuilder, Snowflake, VoiceBasedChannel } from "discord.js";
import { Mode } from "../../Mode";
import { Request } from "../../requests/Request";

export const data = new SlashCommandBuilder()
    .setName( "resume" )
    .setDescription( "Resumes a paused request." )
    .toJSON();

export async function execute( interaction: ChatInputCommandInteraction<"cached"> ): Promise<void> {
    const contract = globalThis.client.contracts.get( interaction.guildId )!;
    const commands: Collection<Snowflake, ApplicationCommand> = await globalThis.client.application!.commands.fetch();
    const playId: Snowflake = commands.filter( command => command.name === "play" ).first()!.id;
    const playChannelId: Snowflake = commands.filter( command => command.name === "play-channel" ).first()!.id;
    const playUserId: Snowflake = commands.filter( command => command.name === "play-user" ).first()!.id;
    const skipId: Snowflake = commands.filter( command => command.name === "skip" ).first()!.id;
    const pauseId: Snowflake = commands.filter( command => command.name === "pause" ).first()!.id;
    let currentReq: Request | null = contract.currentRequest;
    let channel: VoiceBasedChannel | null = globalThis.client.guilds.resolve( contract.guildId )!.members.me!.voice.channel;

    //Respond error message when no requests
    switch ( contract.currentMode ) {
        case Mode.Idle:
        case Mode.Waiting:
            await interaction.reply( {
                embeds: [{
                    title: "❌  Unable to Resume",
                    description: "There's nothing in the queue! Start playing a request with " +
                        `</play:${playId}>, </play-user:${playUserId}>, or </play-channel:${playChannelId}> first, then pause with </pause:${pauseId}>.`
                }],
            } );

            break;
        case Mode.Standby:
            await interaction.reply( {
                embeds: [{
                    title: "❌  Unable to Resume",
                    description: `Temporarily paused while on standby in ${channel!.toString()}. ` +
                        `Wait until standby finishes, join ${channel!.toString()}, or use </skip:${skipId}> to continue playing first, then pause with </pause:${pauseId}>.`
                }],
            } );

            break;
        case Mode.Playing:
            await interaction.reply( {
                embeds: [{
                    title: "❌  Unable to Resume",
                    description: `Already playing [${currentReq!.title}](${currentReq!.resourceUrl!}) in ${channel!.toString()}. Pause it with </pause:${pauseId}> first.`
                }],
            } );

            break;
        case Mode.Paused:
            await contract.resume(); //No execution file because no necessary additional logic or error handling

            await interaction.reply( {
                embeds: [{
                    title: "✅  Resumed a Request",
                    description: `Successfully resumed playing [${currentReq!.title}](${currentReq!.resourceUrl!}) in ${channel!.toString()}.`
                }],
            } );
    }//end switch

    return;
}//end method execute