import {
	authProcedure,
	handleTRCPErr,
	router
}                           from "@server/trpc/trpc";
import { TRPCError }        from "@trpc/server";
import DB_SessionToken      from "@server/MongoDB/DB_SessionToken";
import DB_Accounts          from "@server/MongoDB/DB_Accounts";
import { z }                from "zod";
import { MakeRandomString } from "@kyri123/k-javascript-utils";

export const auth_user = router( {
	logout: authProcedure.mutation( async( { ctx } ) => {
		const { token } = ctx;
		try {
			await DB_SessionToken.findOneAndDelete( { token } );
			return;
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),


	update: authProcedure.input( z.object( {
		data: z.object( {
			mail: z.string().email().optional(),
			username: z.string().optional().min( 6, "Benutzername ist zu kurz" ),
			password: z.string().min( 8, "password ist zu kurz" ).optional()
		} )
	} ) ).mutation( async( { ctx, input } ) => {
		const { data } = input;
		const { userClass } = ctx;
		try {
			const account = await DB_Accounts.findById( userClass.Get._id );
			if ( data.password ) {
				account.setPassword( data.password );
			}
			data.mail && ( account.mail = data.mail );
			data.username && ( account.mail = data.username );

			if ( await account.save() ) {
				await DB_SessionToken.deleteMany( { userid: userClass.Get._id } );
				return "Account bearbeitet. deine Session wurde entfernt du wirst nun ausgeloggt.";
			}
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),


	updateApiKey: authProcedure.mutation( async( { ctx } ) => {
		const { userClass } = ctx;
		try {
			const apiKey = MakeRandomString( 30 );
			const account = await DB_Accounts.findByIdAndUpdate( userClass.Get._id, { apiKey }, { new: true } );
			if ( account ) {
				return apiKey;
			}
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );