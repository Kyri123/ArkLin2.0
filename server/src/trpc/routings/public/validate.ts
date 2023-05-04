import { z }                      from "zod";
import * as jwt                   from "jsonwebtoken";
import {
	publicProcedure,
	router
}                                 from "@server/trpc/trpc";
import type { ClientUserAccount } from "@server/MongoDB/DB_Accounts";
import DB_Accounts                from "@server/MongoDB/DB_Accounts";
import DB_SessionToken            from "@server/MongoDB/DB_SessionToken";
import { TRPCError }              from "@trpc/server";

export const public_validate =
	router( {
		validateSession: publicProcedure.input( z.object( {
			token: z.string()
		} ) ).query<{
			tokenValid : boolean;
		}>( async( { input } ) => {
			try {
				const result = await jwt.verify( input.token, process.env.JWTToken || "" ) as ClientUserAccount;
				const userAccountExsists = !!( await DB_Accounts.exists( { _id: result._id } ) );
				if ( !userAccountExsists ) {
					DB_SessionToken.deleteMany( { userid: result._id } );
				}
				return { tokenValid: !!( await DB_SessionToken.exists( { token: input.token } ) ) && userAccountExsists };
			}
			catch ( e ) {
			}
			return { tokenValid: false };
		} ),

		test: publicProcedure.query( async( { input } ) => {
			try {
				throw new TRPCError( {
					message: "Token konnte nicht erstellt werden.",
					code: "INTERNAL_SERVER_ERROR"
				} );
			}
			catch ( e ) {
				console.log( e );
			}
			return { test: true };
		} )
	} );