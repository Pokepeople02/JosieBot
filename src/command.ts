import { ChatInputCommandInteraction, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";

/**Contains Discord slash command JSON data and wrapper for command execution. */
export interface Command {

    /** JSON data describing the given command for Discord's API. */
    data: RESTPostAPIApplicationCommandsJSONBody;

    /**Wrapper method for bot and discord.js calls which carry out command behavior.
     * Handles determining the appropriate subcommand to execute, when necessary, and replying to the prompting interaction as appropriate.
     * @param interaction The prompting slash-command interaction.
     */
    execute( interaction: ChatInputCommandInteraction<"cached"> ): Promise<void>;

}//end interface Command