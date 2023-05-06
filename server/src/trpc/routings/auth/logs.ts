import {
	handleTRCPErr,
	router,
	serverProcedure
}                    from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server";

export const auth_logs = router( {
	getServerLogs: serverProcedure.query( async( { ctx } ) => {
		const { server } = ctx;
		try {
			return server.GetLogFiles();
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );