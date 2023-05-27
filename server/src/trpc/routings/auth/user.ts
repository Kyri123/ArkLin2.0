import { MakeRandomString } from "@kyri123/k-javascript-utils";
import MongoAccounts from "@server/MongoDB/MongoAccounts";
import MongoSessionToken from "@server/MongoDB/MongoSessionToken";
import {
	authProcedure,
	handleTRCPErr,
	router
} from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const authUser = router( {
	logout: authProcedure.mutation( async( { ctx } ) => {
		const { token } = ctx;
		try {
			await MongoSessionToken.findOneAndDelete( { token } );
			return;
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),


	update: authProcedure.input( z.object( {
		data: z.object( {
			mail: z.string().email().optional(),
			username: z.string().min( 6, "Benutzername ist zu kurz" ).optional(),
			password: z.string().min( 8, "password ist zu kurz" ).optional()
		} )
	} ) ).mutation( async( { ctx, input } ) => {
		const { data } = input;
		const { userClass } = ctx;
		try {
			const account = await MongoAccounts.findById( userClass.get._id );
			if( data.password ) {
				account.setPassword( data.password );
			}
			data.mail && ( account.mail = data.mail );
			data.username && ( account.mail = data.username );

			if( await account.save() ) {
				await MongoSessionToken.deleteMany( { userid: userClass.get._id } );
				return "Account bearbeitet. deine Session wurde entfernt du wirst nun ausgeloggt.";
			}
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),


	updateApiKey: authProcedure.mutation( async( { ctx } ) => {
		const { userClass } = ctx;
		try {
			const apiKey = MakeRandomString( 30 );
			const account = await MongoAccounts.findByIdAndUpdate( userClass.get._id, { apiKey }, { new: true } );
			if( account ) {
				return apiKey;
			}
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );
