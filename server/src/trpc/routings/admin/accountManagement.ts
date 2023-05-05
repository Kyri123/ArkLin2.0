import {
	handleTRCPErr,
	router,
	superAdminProcedure
}                           from "@server/trpc/trpc";
import { TRPCError }        from "@trpc/server";
import type { UserAccount } from "@server/MongoDB/DB_Accounts";
import DB_Accounts          from "@server/MongoDB/DB_Accounts";
import { z }                from "zod";
import type { AccountKey }  from "@server/MongoDB/DB_AccountKey";
import DB_AccountKey        from "@server/MongoDB/DB_AccountKey";

export const auth_accountManagement = router( {
	getalluser: superAdminProcedure.input( z.object( {
		skip: z.number().optional(),
		limit: z.number().optional()
	} ) ).query( async( { input } ) => {
		const { skip, limit } = input;
		try {
			const accounts : UserAccount[] = await DB_Accounts.find<UserAccount>( {}, {
				password: 0,
				hash: 0,
				salt: 0
			}, { skip, limit } );
			return { accounts, total: await DB_Accounts.count() };
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	getallkeys: superAdminProcedure.input( z.object( {
		skip: z.number().optional(),
		limit: z.number().optional()
	} ) ).query( async( { input } ) => {
		const { skip, limit } = input;
		try {
			const keys = await DB_AccountKey.find<AccountKey>( { isPasswordReset: { $ne: true } }, {}, {
				skip,
				limit
			} );
			return { keys, total: await DB_Accounts.count() };
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );