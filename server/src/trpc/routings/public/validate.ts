import { z }                      from "zod";
import * as jwt                   from "jsonwebtoken";
import {
	publicProcedure,
	router
}                                 from "@server/trpc/trpc";
import type { ClientUserAccount } from "@server/MongoDB/DB_Accounts";
import DB_Accounts                from "@server/MongoDB/DB_Accounts";
import DB_SessionToken            from "@server/MongoDB/DB_SessionToken";
import DB_AccountKey              from "@server/MongoDB/DB_AccountKey";
import { GetSecretAppToken }      from "@server/Lib/User.Lib";

export const public_validate =
	router( {
		validateSession: publicProcedure.input( z.object( {
			token: z.string()
		} ) ).query<{
			tokenValid : boolean;
		}>( async( { input } ) => {
			try {
				const result = await jwt.verify( input.token, GetSecretAppToken() ) as ClientUserAccount;
				const userAccountExsists = !!( await DB_Accounts.exists( { _id: result._id } ) );
				if ( !userAccountExsists ) {
					DB_SessionToken.deleteMany( { userid: result._id } );
				}
				return { tokenValid: !!( await DB_SessionToken.exists( { token: input.token } ) ) && userAccountExsists };
			}
			catch ( e ) {
				console.log( e );
			}
			return { tokenValid: false };
		} ),

		validateResetToken: publicProcedure.input( z.object( {
			token: z.string()
		} ) ).query<{
			tokenValid : boolean;
		}>( async( { input } ) => {
			try {
				return {
					tokenValid: !!( await DB_AccountKey.exists( {
						key: input.token,
						isPasswordReset: true
					} ) )
				};
			}
			catch ( e ) {
			}
			return { tokenValid: false };
		} )
	} );