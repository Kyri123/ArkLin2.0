import { getSecretAppToken } from "@/server/src/Lib/user.Lib";
import MongoAccountKey from "@server/MongoDB/MongoAccountKey";
import type { ClientUserAccount } from "@server/MongoDB/MongoAccounts";
import MongoAccounts from "@server/MongoDB/MongoAccounts";
import MongoSessionToken from "@server/MongoDB/MongoSessionToken";
import {
	publicProcedure,
	router
} from "@server/trpc/trpc";
import * as jwt from "jsonwebtoken";
import { z } from "zod";


export const publicValidate =
	router( {
		validateSession: publicProcedure.input( z.object( {
			token: z.string()
		} ) ).query<{
			tokenValid: boolean
		}>( async( { input } ) => {
			try {
				const result = await jwt.verify( input.token, getSecretAppToken() ) as ClientUserAccount;
				const userAccountExsists = !!( await MongoAccounts.exists( { _id: result._id } ) );
				if( !userAccountExsists ) {
					MongoSessionToken.deleteMany( { userid: result._id } );
				}
				return { tokenValid: !!( await MongoSessionToken.exists( { token: input.token } ) ) && userAccountExsists };
			} catch( e ) {
				if( e instanceof Error ) {
					SystemLib.debugLog( "api", e.message );
				}
			}
			return { tokenValid: false };
		} ),

		validateResetToken: publicProcedure.input( z.object( {
			token: z.string()
		} ) ).query<{
			tokenValid: boolean
		}>( async( { input } ) => {
			try {
				return {
					tokenValid: !!( await MongoAccountKey.exists( {
						key: input.token,
						isPasswordReset: true
					} ) )
				};
			} catch( e ) {
				if( e instanceof Error ) {
					SystemLib.debugLog( "api", e.message );
				}
			}
			return { tokenValid: false };
		} )
	} );
