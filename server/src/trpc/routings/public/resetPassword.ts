import { createSession } from "@/server/src/Lib/user.Lib";
import MongoAccountKey from "@server/MongoDB/MongoAccountKey";
import MongoAccounts from "@server/MongoDB/MongoAccounts";
import {
	handleTRCPErr,
	publicProcedure
} from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const publicResetPassword = publicProcedure.input( z.object( {
	key: z.string().min( 6, { message: "Token ist zu kurz!" } ).refine( async e => !!await MongoAccountKey.exists( { key: e, isPasswordReset: true } ), { message: "Token ist nicht gültig!" } ),
	password: z.string().min( 8, { message: "Passwort muss mindestens 8 Zeichen lang sein." } )
} ) ).mutation( async( { input } ) => {
	const { key, password } = input;

	try {
		const token = await MongoAccountKey.findOne( {
			key,
			isPasswordReset: true
		} );
		if( token ) {
			const userDocument = await MongoAccounts.findById( token.userId! );
			if( userDocument ) {
				userDocument.setPassword( password );
				if( await userDocument.save() ) {
					await MongoAccountKey.deleteMany( { userId: token.userId } );
					const sessionToken = await createSession( userDocument.toJSON() );
					if( sessionToken ) {
						return {
							sessionToken,
							message: `Password wurde gespeichert. Willkommen ${ userDocument.username }`
						};
					}
					throw new TRPCError( {
						message: "Token konnte nicht erstellt werden.",
						code: "INTERNAL_SERVER_ERROR"
					} );
				}
			}
		}
	} catch( e ) {
		handleTRCPErr( e );
	}
	throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
} );
