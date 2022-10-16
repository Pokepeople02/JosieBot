import { ChatInputCommandInteraction, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";

/**Contains Discord slash command JSON data and wrapper for command execution. */
export interface Command {

    /** Descriptive data  */
    data: RESTPostAPIApplicationCommandsJSONBody;

    /**Wrapper method for bot and discord.js calls which carry out command behavior.
     * @param interaction The prompting slash-command interaction.
     */
    execute( interaction: ChatInputCommandInteraction ): Promise<void>;

}//end interface Command