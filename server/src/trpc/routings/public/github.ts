import { TRPCError }          from "@trpc/server";
import {
	handleTRCPErr,
	publicProcedure,
	router
}                             from "@server/trpc/trpc";
import type { GithubRelease } from "@server/MongoDB/DB_GithubReleases";
import DB_GithubReleases      from "@server/MongoDB/DB_GithubReleases";

export const public_github = router( {
	changelogs: publicProcedure.query( async() => {
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