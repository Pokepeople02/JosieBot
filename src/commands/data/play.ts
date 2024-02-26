import { APIEmbedField, ChatInputCommandInteraction, SlashCommandBuilder, Snowflake, StageChannel } from "discord.js";
import { play } from "../execution/Play";
import { Request } from "../../requests/Request";
import { BadRequestError } from "../../errors/BadRequestError";
import { TimeoutError } from "../../errors/TimeoutError";
import { ResourceUnobtainableError } from "../../errors/ResourceUnobtainableError";
import { EmbedBuilder } from "@discordjs/builders";
import { UnresolvedChannelError } from "../../errors/UnresolvedChannelError";
import { NoResultsError } from "../../errors/NoResultsError";

export const data = new SlashCommandBuilder()
    .setName( "play" )
    .setDescription( "Adds a new request to the queue for your current voice channel." )
    .addStringOption( option => option
        .setName( "request" )
        .setDescription( "Your request to be played." )
        .setRequired( true )
    )
    .toJSON();

/** Determines the voice channel of the calling user, initiates the behavior to handle the request made, and replies to the prompting interaction. */
export async function execute( interaction: ChatInputCommandInteraction<"cached"> ): Promise<void> {
    const user = interaction.member;
    const userVoice = user.voice.channel;
    const playId: Snowflake = ( await globalThis.client.application!.commands.fetch() ).filter( command => command.name === "play" ).first()!.id;
    let request: Request;

    //User not in voice channel, respond for failure
    if ( !userVoice ) {

        globalThis.client.log( "Failed /play: not in voice", interaction );
        await interaction.reply( {
            embeds: [{
                title: "❌  Unable to Add Request",
                description: `You need to be in a voice channel to use </play:${playId}>. Join a voice channel or use a different command to add requests.`,
            }],
        } );

        return;
    } else if ( userVoice instanceof StageChannel ) {

        globalThis.client.log( "Failed /play: trying to play in stage", interaction );
        await interaction.reply( {
            embeds: [{
                title: "❌  Unable to Add Request",
                description: `Cannot play in ${userVoice.toString()} as stage channels are not currently supported. Please try a different channel.`,
            }],
        } );

        return;
    }//end if-else

    await interaction.deferReply();

    //Initiate play or respond if failed
    try { request = await play( interaction, userVoice.id ); }
    catch ( error ) {

        globalThis.client.log( `Failed to add request -- ${error}`, interaction );
        await interaction.editReply( { embeds: [getPlayFailedResponseEmbed( error )] } );

        return;
    }//end try-catch

    //Reply for play success
    await interaction.editReply( {
        embeds: [{
            title: "✅  Added a Request",
            description: `Successfully queued [${request.title!}](${request.resourceUrl!}) for your channel (${userVoice.toString()}).`,
            thumbnail: request.thumbnailUrl ? { url: request.thumbnailUrl } : undefined,
            fields: getPlaySuccessEmbedFields( request )
        }],
    } );

    return;
}//end method execute

/**Builds the embed for the reply after a /play command fails with a specific error message for the failure that occurred.
 * @param {unknown} error The error that occurred when attempting to play the request.
 * @return The created embed
 */
export function getPlayFailedResponseEmbed( error: unknown, ): EmbedBuilder {
    let replyEmbed = new EmbedBuilder();

    replyEmbed.setTitle( "❌  Unable to Add Request" );

    if ( error instanceof BadRequestError ) {
        switch ( error.type ) {
            case "invalid":
                replyEmbed.setDescription( "Request is invalid and cannot be played. Please try a different request." );
                break;
            case "unknown":
                replyEmbed.setDescription( "Unable to determine what kind of request this is. Please try a different request." );
                break;
            case "unsupported":
                replyEmbed.setDescription( "This type of request is not yet supported. Please try a different request." );
                break;
        }//end switch
    } else if ( error instanceof UnresolvedChannelError ) {
        replyEmbed.setDescription( "Unable to determine what channel to play this request in. Please try a different channel." );
    } else if ( error instanceof TimeoutError ) {
        replyEmbed.setDescription( "This request took too long to resolve. Please try again or try a different request." );
    } else if ( error instanceof ResourceUnobtainableError ) {
        switch ( error.type ) {
            case "ageRestrictedCookies":
                replyEmbed.setDescription( "This request is age-restricted and the YouTube cookies loaded are for an account below age 18. Please try a different request, ask the bot owner to set cookies for an 18+ YouTube account, or wait until the corresponding account is age 18." );
                break;
            case "ageRestrictedNoCookies":
                replyEmbed.setDescription( "This request is age-restricted and no YouTube cookies are available for sign-in. Please try a different request, or ask the bot owner to set YouTube cookies and try again." );
                break;
            default:
                replyEmbed.setDescription( "Could not obtain necessary info about this request, it may not be valid. Please try again or try a different request." );
                break;
        }//end switch
    } else if ( error instanceof NoResultsError ) {
        replyEmbed.setDescription( "There were no search results for this request. Please try a different request." );
    } else {
        replyEmbed.setDescription( "An unknown error occurred while adding this request. Please try again or try a different request." );
    }//end if-else

    return replyEmbed;
}//end method getPlayFailedResponseEmbed

/**Builds the duration, Uploaded By, and optional Note embed fields for the reply after a sucessful /play command.
 * @param {Request} request The request queued
 * @return Array containing the created embed fields
 */
export function getPlaySuccessEmbedFields( request: Request ): APIEmbedField[] {
    let embedFields: APIEmbedField[];
    let lengthText: string = "";
    let descriptionText: string | undefined;

    //Set up length text and optional description. Special values apply for livestreams or upcoming/not yet published requests.
    if ( request.live ) {
        lengthText = "🔴 LIVE";
    } else if ( request.upcoming! ) {
        lengthText = "⭕ UPCOMING";

        if ( request.upcoming === true ) {
            descriptionText = "This request is upcoming. It has not been published yet.";
        } else {
            descriptionText = `This request is upcoming and scheduled to premiere on ${request.upcoming.toDateString()} at ${request.upcoming.toTimeString()}.`;
        }//end if-else

    } else {
        lengthText = request.lengthFormatted!;
    }//end if-else

    console.log( lengthText );

    //Build embed fields
    embedFields = [{
        name: "Duration",
        value: lengthText,
        inline: true,
    }, {
        name: "Uploaded by",
        value: request.creator!,
        inline: true,
    }];

    if ( descriptionText ) {
        embedFields.push( {
            name: "",
            value: descriptionText,
            inline: false
        } );
    }//end if

    return embedFields;
}//end method getPlaySuccessEmbedFields