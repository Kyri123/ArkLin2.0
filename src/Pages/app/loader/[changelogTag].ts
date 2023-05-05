import type { LoaderFunction } from "react-router-dom";
import {
	json,
	redirect
}                              from "react-router-dom";
import { tRPC_Public }         from "@app/Lib/tRPC";
import type { GithubRelease }       from "@server/MongoDB/DB_GithubReleases";

export interface ChangelogLoaderProps {
	changelog : GithubRelease;
}

const loader : LoaderFunction = async( { params } ) => {
	const { changelogTag } = params;
	const changelogResult = await tRPC_Public.github.getChangelogFor.query( {
		tag_name: changelogTag!
	} ).catch( () => {
	} );

	if ( !changelogResult?.changelog ) {
		return redirect( "/error/404" );
	}

	return json<ChangelogLoaderProps>( { changelog: changelogResult.changelog } );
};

export { loader };