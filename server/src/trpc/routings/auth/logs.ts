import {
	handleTRCPErr,
	router,
	serverProcedure
} from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server";


export const authLogs = router( {
	getServerLogs: serverProcedure.query( async( { ctx } ) => {
		const { server } = ctx;
		try {
			return server.getLogFiles();
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );
