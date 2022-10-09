
/**An error occurring when a non-voice-based channel was provided where a voice-based one was expected. */
export class NonVoiceChannelError extends TypeError {

    /**Creates a new NonVoiceChannelError for when a non-voice channel was unexpectedly provided.
     * @param message The error message.
     */
    constructor( message: string ) {
        super( message );
    }//end constructor

}//end class NonVoiceChannelError