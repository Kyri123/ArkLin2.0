import {
	authProcedure,
	handleTRCPErr,
	permissionMiddleware,
	router
}                    from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { EPerm }     from "@shared/Enum/User.Enum";

export const auth_panelAdmin = router( {
	getPanelLog: authProcedure.use( permissionMiddleware( EPerm.PanelLog ) ).query( async() => {
		try {
			return [ "" ];
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );