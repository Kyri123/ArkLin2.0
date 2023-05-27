import {
	apiHandleError,
	apiPublic
} from "@app/Lib/tRPC";
import type { GithubRelease } from "@server/MongoDB/MongoGithubReleases";
import type { LoaderFunction } from "react-router-dom";
import { json } from "react-router-dom";


export interface IndexLoaderProps {
	changelogs: GithubRelease[]
}

const loader: LoaderFunction = async() => {
	const releases = await apiPublic.github.changelogs.query().catch( apiHandleError );

	const changelogs: GithubRelease[] = releases?.changelogs || [];

	return json<IndexLoaderProps>( { changelogs } );
};

export { loader };

