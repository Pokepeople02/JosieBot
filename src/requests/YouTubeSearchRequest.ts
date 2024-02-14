import { search, video_info, YouTubeVideo } from "play-dl";
import { NoResultsError } from "../errors/NoResultsError";
import { ResourceUnobtainableError } from "../errors/ResourceUnobtainableError";
import { YouTubeVideoRequest } from "./YouTubeVideoRequest";

export class YouTubeSearchRequest extends YouTubeVideoRequest {

    /**
     * @throws {@link ResourceUnobtainableError} When an error occurs while retreiving search or request info.
     * @throws {@link NoResultsError} If the search yeilds no results.
     */
    public async init(): Promise<void> {
        let searchResults: YouTubeVideo[];

        if ( this.ready )
            return;

        try {
            searchResults = await search( this.input, {
                source: { youtube: "video" },
                limit: 1,
                language: "en-US",
                unblurNSFWThumbnails: true
            } );
        } catch ( error ) {
            throw new NoResultsError( `${error}` );
        }//end try-catch

        if ( !searchResults || searchResults.length < 1 )
            throw new NoResultsError( `No results for "${this.input}"` );

        try {
            this.info = await video_info( searchResults[0].url );
        } catch ( error ) {
            throw new ResourceUnobtainableError( `${error}` );
        }//end try-catch

        return;
    }//end method init

}//end class YouTubeSearchRequest