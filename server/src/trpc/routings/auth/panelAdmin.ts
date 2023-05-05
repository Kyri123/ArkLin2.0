import {
	authProcedure,
	handleTRCPErr,
	permissionMiddleware,
	router
}                    from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { EPerm }     from "@shared/Enum/User.Enum";
import { RunUpdate } from "@server/Lib/System.Lib";

export const auth_panelAdmin = router( {
	update: authProcedure.use( permissionMiddleware( EPerm.PanelLog ) ).mutation( async() => {
		try {
			RunUpdate();
			return "Panel wird Geupdated!";
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	restart: authProcedure.use( permissionMiddleware( EPerm.PanelLog ) ).mutation( async() => {
		try {
			setTimeout( () => {
				SystemLib.LogWarning( "system",
					"User Request:",
					SystemLib.ToBashColor( "Red" ),
					"RESTART"
				);
				process.exit( 0 );
			}, 1000 );
			return "Panel wird neugestartet!";
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );