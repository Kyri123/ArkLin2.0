import { TRPCError }                       from "@trpc/server";
import {
	handleTRCPErr,
	publicProcedure,
	router
}                                          from "@server/trpc/trpc";
import type { GithubRelease }              from "@server/MongoDB/DB_GithubReleases";
import DB_GithubReleases                   from "@server/MongoDB/DB_GithubReleases";
import { z }                               from "zod";
import type { GithubBranch } from "@server/MongoDB/DB_GithubBranches";
import DB_GithubBranches from "@server/MongoDB/DB_GithubBranches";

export const public_github = router( {
	branches: publicProcedure.query( async() => {
		try {
			const branches = await DB_GithubBranches.find<GithubBranch>();
			return { branches };
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	changelogs: publicProcedure.query( async() => {
		try {
			const changelogs = await DB_GithubReleases.find<GithubRelease>();
			return { changelogs };
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	getChangelogFor: publicProcedure.input( z.object( {
		tag_name: z.string()
	} ) ).query( async( { input } ) => {
		const { tag_name } = input;
		try {
			const changelog = ( await DB_GithubReleases.findOne( { tag_name } ) )!.toJSON() as GithubRelease;
			return { changelog };
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );