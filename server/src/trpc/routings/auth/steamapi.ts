import type { SteamMod } from "@server/MongoDB/MongoSteamAPIMods";
import MongoSteamAPIMods from "@server/MongoDB/MongoSteamAPIMods";
import {
	authProcedure,
	handleTRCPErr,
	router
} from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server";


export const authSteamapi = router( {
	getMods: authProcedure.query( async() => {
		try {
			return await MongoSteamAPIMods.find<SteamMod>( {} );
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );
