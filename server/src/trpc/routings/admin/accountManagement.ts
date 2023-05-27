import { MakeRandomString } from "@kyri123/k-javascript-utils";
import type { AccountKey } from "@server/MongoDB/MongoAccountKey";
import MongoAccountKey from "@server/MongoDB/MongoAccountKey";
import type { UserAccount } from "@server/MongoDB/MongoAccounts";
import MongoAccounts from "@server/MongoDB/MongoAccounts";
import {
	handleTRCPErr,
	router,
	superAdminProcedure
} from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const authAccountManagement = router( {
	createAccountKey: superAdminProcedure.input( z.boolean().optional() ).mutation( async( { input } ) => {
		try {
			await MongoAccountKey.create( {
				key: MakeRandomString( input ? 40 : 20, "-", 10 ),
				asSuperAdmin: !!input
			} );
			return "Accountschlüssel wurde erstellt";
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	removeAccountKey: superAdminProcedure.input( z.string() ).mutation( async( { input } ) => {
		try {
			await MongoAccountKey.findByIdAndDelete( input );
			return "Accountschlüssel wurde entfernt";
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	removeAccount: superAdminProcedure.input( z.string() ).mutation( async( { input } ) => {
		try {
			await MongoAccounts.findByIdAndDelete( input );
			return "Account wurde entfernt";
		} catch( e ) {
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
			await MongoAccounts.findByIdAndUpdate( accountId, { servers, permissions } );
			return "Account wurde bearbeitet";
		} catch( e ) {
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
			const accounts: UserAccount[] = await MongoAccounts.find<UserAccount>( {}, {
				password: 0,
				hash: 0,
				salt: 0
			}, { skip, limit } );
			return { accounts, total: await MongoAccounts.count() };
		} catch( e ) {
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
			const keys = await MongoAccountKey.find<AccountKey>( { isPasswordReset: { $ne: true } }, {}, {
				skip,
				limit
			} );
			return { keys, total: await MongoAccountKey.count( { isPasswordReset: { $ne: true } } ) };
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );
