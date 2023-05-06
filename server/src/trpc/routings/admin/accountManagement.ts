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
import { MakeRandomString } from "@kyri123/k-javascript-utils";

export const auth_accountManagement = router( {
	createAccountKey: superAdminProcedure.input( z.boolean().optional() ).mutation( async( { input } ) => {
		try {
			await DB_AccountKey.create( {
				key: MakeRandomString( input ? 40 : 20, "-", 10 ),
				asSuperAdmin: !!input
			} );
			return "Accountschlüssel wurde erstellt";
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	removeAccountKey: superAdminProcedure.input( z.string() ).mutation( async( { input } ) => {
		try {
			await DB_AccountKey.findByIdAndDelete( input );
			return "Accountschlüssel wurde entfernt";
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	removeAccount: superAdminProcedure.input( z.string() ).mutation( async( { input } ) => {
		try {
			await DB_Accounts.findByIdAndDelete( input );
			return "Account wurde entfernt";
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	updatePermissions: superAdminProcedure.input( z.object( {
		accountId: z.string( z.string() ),
		servers: z.array( z.string() ),
		permissions: z.array( z.string() )
	} ) ).mutation( async( { input } ) => {
		const { accountId, servers, permissions } = input;
		try {
			await DB_Accounts.findByIdAndUpdate( accountId, { servers, permissions } );
			return "Account wurde bearbeitet";
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

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
			return { keys, total: await DB_AccountKey.count( { isPasswordReset: { $ne: true } } ) };
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );