import type { GithubBranch } from "@server/MongoDB/MongoGithubBranches";
import MongoGithubBranches from "@server/MongoDB/MongoGithubBranches";
import type { GithubRelease } from "@server/MongoDB/MongoGithubReleases";
import MongoGithubReleases from "@server/MongoDB/MongoGithubReleases";
import {
	handleTRCPErr,
	publicProcedure,
	router
} from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const publicGithub = router( {
	branches: publicProcedure.query( async() => {
		try {
			const branches = await MongoGithubBranches.find<GithubBranch>();
			return { branches };
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	changelogs: publicProcedure.query( async() => {
		try {
			const changelogs = await MongoGithubReleases.find<GithubRelease>();
			return { changelogs };
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	getChangelogFor: publicProcedure.input( z.object( {
		tag_name: z.string()
	} ) ).query( async( { input } ) => {
		const { tag_name } = input;
		try {
			const changelog = ( await MongoGithubReleases.findOne( { tag_name } ) )!.toJSON() as GithubRelease;
			return { changelog };
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );
