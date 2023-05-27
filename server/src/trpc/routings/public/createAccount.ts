import { createSession } from "@/server/src/Lib/user.Lib";
import MongoAccountKey from "@server/MongoDB/MongoAccountKey";
import MongoAccounts from "@server/MongoDB/MongoAccounts";
import {
	handleTRCPErr,
	publicProcedure
} from "@server/trpc/trpc";
import { EPerm } from "@shared/Enum/User.Enum";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const publicCreateAccount =
	publicProcedure.input( z.object( {
		key: z.string().min( 6, { message: "Token ist zu kurz!" } ).refine( async e => !!await MongoAccountKey.exists( { key: e, isPasswordReset: { $ne: true } } ), { message: "Token ist nicht gültig!" } ),
		username: z.string().min( 6, { message: "Benutzername ist zu kurz" } ),
		email: z.string().email( { message: "Email hat ein falsches format" } ),
		password: z.string().min( 8, { message: "Passwort ist zu kurz" } )
	} ) ).mutation<{
		sessionToken: string,
		message: string
	}>( async( { input } ) => {
		const { password, email, username, key } = input;
		try {
			const token = await MongoAccountKey.findOne( {
				key,
				isPasswordReset: { $ne: true }
			} );
			if( token ) {
				if( !await MongoAccounts.exists( {
					$or: [
						{ username },
						{ email }
					]
				} ) ) {
					const userDocument = new MongoAccounts();

					userDocument.permissions = token.asSuperAdmin ? [ EPerm.Super ] : [];
					userDocument.username = username;
					userDocument.mail = email;
					userDocument.setPassword( password );

					if( await userDocument.save() ) {
						await token.deleteOne();
						const sessionToken = await createSession( userDocument.toJSON() );
						if( sessionToken ) {
							return {
								sessionToken,
								message: `Account wurde erstellt. Willkommen ${ userDocument.username }`
							};
						}
						throw new TRPCError( {
							message: "Token konnte nicht erstellt werden.",
							code: "INTERNAL_SERVER_ERROR"
						} );
					}
					throw new TRPCError( {
						message: "Benutzer konnte nicht gespeichert werden.",
						code: "INTERNAL_SERVER_ERROR"
					} );
				}
			}
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} );
