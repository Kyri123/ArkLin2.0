import { createSession } from "@/server/src/Lib/user.Lib";
import { MakeRandomString } from "@kyri123/k-javascript-utils";
import MongoAccountKey from "@server/MongoDB/MongoAccountKey";
import MongoAccounts from "@server/MongoDB/MongoAccounts";
import {
	handleTRCPErr,
	publicProcedure
} from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const publicLogin = publicProcedure.input( z.object( {
	login: z.string().min( 6, { message: "Benutzername muss mindestens 6 Zeichen lang sein." } ),
	password: z.string().min( 8, { message: "Passwort muss mindestens 8 Zeichen lang sein." } ),
	stayLoggedIn: z.boolean()
} ) ).mutation( async( { input } ) => {
	const { login, password, stayLoggedIn } = input;

	try {
		if( password.length >= 8 && login.length >= 6 ) {
			const userDocument = await MongoAccounts.findOne( {
				$or: [
					{ email: login },
					{ username: login }
				]
			} );
			if( userDocument ) {
				if( userDocument.salt === undefined ) {
					const token = await MongoAccountKey.create( {
						key: MakeRandomString( 25, "-" ),
						asSuperAdmin: false,
						isPasswordReset: true,
						userId: userDocument._id
					} );
					if( token ) {
						return {
							passwordResetToken: token.key,
							message: `Es wurde ein altes Password Format gefunden. Bitte gebe ein neues Passwort ein.`
						};
					}
				} else if( userDocument.validPassword( password ) ) {
					const token = await createSession( userDocument.toJSON(), stayLoggedIn );
					if( token ) {
						return { token, message: `Willkommen ${ userDocument.username }` };
					}
				}
			}
			throw new TRPCError( { message: "Password ist falsch!", code: "BAD_REQUEST" } );
		}
	} catch( e ) {
		handleTRCPErr( e );
	}
	throw new TRPCError( { message: "Etwas ist schiefgegangen", code: "BAD_REQUEST" } );
} );
