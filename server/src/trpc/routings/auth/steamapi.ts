import {
	authProcedure,
	handleTRCPErr,
	router
}                        from "@server/trpc/trpc";
import { TRPCError }     from "@trpc/server";
import type { SteamMod } from "@server/MongoDB/DB_SteamAPI_Mods";
import DB_SteamAPI_Mods  from "@server/MongoDB/DB_SteamAPI_Mods";

export const auth_steamapi = router( {
	getMods: authProcedure.query( async() => {
		try {
			return await DB_SteamAPI_Mods.find<SteamMod>( {} );
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );