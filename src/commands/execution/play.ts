import { ChatInputCommandInteraction, Snowflake } from "discord.js";
import { NonVoiceChannelError } from "../../errors/NonVoiceChannelError";
import { UnresolvedChannelError } from "../../errors/UnresolvedChannelError";
import { TimeoutError } from "../../errors/TimeoutError";
import { ResourceUnobtainableError } from "../../errors/ResourceUnobtainableError";
import { createRequest } from "../../requests/CreateRequest";
import { Request } from "../../requests/Request";

/**Adds a request to the queue for the guild from which the given interaction originated, to be played in the channel specified.
 * If the queue for that guild was previously empty, begins playing the request.
 * @param {ChatInputCommandInteraction} interaction The prompting interaction.
 * @param {Snowflake} channelId The ID of the channel in which to play the request.
 * @returns {Promise<Request>} A promise for the request to be added to the queue.
 * @throws {@link BadRequestError} When the type of request wanted is invalid, unsupported, or unable to be determined.
 * @throws {@link UnresolvedUserError} When the requesting user's ID is unable to be resolved.
 * @throws {@link DurationError} When the `start` or `end` durations are not in a valid range for that request.
 * @throws {@link UnresolvedChannelError} When the target channel ID is unable to be resolved.
 * @throws {@link NonVoiceChannelError} When the target channel ID resolves to a non-voice channel.
 * @throws {@link TimeoutError} When retreiving request info takes too long to fulfill.
 * @throws {@link ResourceUnobtainableError} When an error occurs while retreiving request info.
 */
export async function play( interaction: ChatInputCommandInteraction<"cached">, channelId: Snowflake ): Promise<Request> {
    const contract = globalThis.client.contracts.get( interaction.guildId! )!;
    const input = interaction.options.getString( "request", true );
    const userId = interaction.member.id;
    let request: Request;

    request = await createRequest( input, userId, channelId );
    contract.add( request );

    return request;
}//end function play