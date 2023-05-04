import { z }             from "zod";
import { TRPCError }     from "@trpc/server";
import {
	handleTRCPErr,
	publicProcedure
}                        from "@server/trpc/trpc";
import DB_AccountKey     from "@server/MongoDB/DB_AccountKey";
import DB_Accounts       from "@server/MongoDB/DB_Accounts";
import { CreateSession } from "@server/Lib/User.Lib";

export const public_resetPassword = publicProcedure.input( z.object( {
	key: z.string().min( 6, { message: "Token ist zu kurz!" } ).refine( async e => {
		return !!await DB_AccountKey.exists( { key: e, isPasswordReset: true } );
	}, { message: "Token ist nicht gültig!" } ),
	password: z.string().min( 8, { message: "Password is to short." } )
} ) ).mutation( async( { input } ) => {
	const { key, password } = input;
 
	try {
		const token = await DB_AccountKey.findOne( {
			key,
			isPasswordReset: true
		} );
		if ( token ) {
			const userDocument = await DB_Accounts.findById( token.userId! );
			if ( userDocument ) {
				userDocument.setPassword( password );
				if ( await userDocument.save() ) {
					await DB_AccountKey.deleteMany( { userId: token.userId } );
					const sessionToken = await CreateSession( userDocument.toJSON() );
					if ( sessionToken ) {
						return {
							sessionToken,
							message: "Password wurde gespeichert. Du wirst nun eingeloggt."
						};
					}
					throw new TRPCError( {
						message: "Token konnte nicht erstellt werden.",
						code: "INTERNAL_SERVER_ERROR"
					} );
				}
			}
		}
	}
	catch ( e ) {
		handleTRCPErr( e );
	}
	throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
} );