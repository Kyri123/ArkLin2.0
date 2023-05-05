import {
	authProcedure,
	handleTRCPErr,
	router
}                           from "@server/trpc/trpc";
import { TRPCError }        from "@trpc/server";
import {
	GetAllClusterWithPermission,
	GetAllServerWithPermission
}                           from "@server/Lib/User.Lib";
import type { SystemUsage } from "@server/MongoDB/DB_Usage";
import DB_Usage             from "@server/MongoDB/DB_Usage";

export const auth_globalState = router( {
	getallserver: authProcedure.query( async( { ctx } ) => {
		try {
			return await GetAllServerWithPermission( ctx.userClass );
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	getallcluster: authProcedure.query( async( { ctx } ) => {
		try {
			return await GetAllClusterWithPermission( ctx.userClass );
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	state: authProcedure.query( async( { ctx } ) => {
		try {
			let [ Online, Offline, Total ] = [ 0, 0, 0 ];
			for ( const InstanceData of Object.values( await GetAllServerWithPermission( ctx.userClass ) ) ) {
				Total++;
				if ( InstanceData.State.IsListen ) {
					Online++;
					continue;
				}
				Offline++;
			}
			return [ Online, Offline, Total ];
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	systemUsage: authProcedure.query( async() => {
		try {
			return ( await DB_Usage.findOne( {} ) )!.toJSON() as SystemUsage;
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );