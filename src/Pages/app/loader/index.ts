import type { LoaderFunction } from "react-router-dom";
import { json }                from "react-router-dom";
import {
	tRPC_handleError,
	tRPC_Public
}                              from "@app/Lib/tRPC";
import type { GithubRelease }  from "@server/MongoDB/DB_GithubReleases";

export interface IndexLoaderProps {
	changelogs : GithubRelease[]
}

const loader : LoaderFunction = async() => {
	const releases = await tRPC_Public.github.changelogs.query().catch( tRPC_handleError );

	const changelogs : GithubRelease[] = releases?.changelogs || []

	return json<IndexLoaderProps>( { changelogs } );
};

export { loader };