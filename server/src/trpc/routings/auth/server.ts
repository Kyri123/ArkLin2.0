import {
	authProcedure,
	handleTRCPErr,
	router
}                             from "@server/trpc/trpc";
import type { GithubRelease } from "@server/MongoDB/DB_GithubReleases";
import DB_GithubReleases      from "@server/MongoDB/DB_GithubReleases";
import { TRPCError }          from "@trpc/server";

export const public_github = router( {
	getallserver: authProcedure.query( async( { ctx } ) => {
		try {
			const changelogs = await DB_GithubReleases.find<GithubRelease>();
			return { changelogs };
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} )