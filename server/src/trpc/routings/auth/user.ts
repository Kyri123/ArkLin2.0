import {
	authProcedure,
	handleTRCPErr,
	router
}                      from "@server/trpc/trpc";
import { TRPCError }   from "@trpc/server";
import DB_SessionToken from "@server/MongoDB/DB_SessionToken";

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
	} )
} );