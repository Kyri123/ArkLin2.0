import {
	getAllClusterWithPermission,
	getAllServerWithPermission
} from "@/server/src/Lib/user.Lib";
import type { SystemUsage } from "@server/MongoDB/MongoUsage";
import MongoUsage from "@server/MongoDB/MongoUsage";
import {
	authProcedure,
	handleTRCPErr,
	router
} from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server";


export const authGlobalState = router( {
	getallserver: authProcedure.query( async( { ctx } ) => {
		try {
			return await getAllServerWithPermission( ctx.userClass );
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	getallcluster: authProcedure.query( async( { ctx } ) => {
		try {
			return await getAllClusterWithPermission( ctx.userClass );
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	state: authProcedure.query( async( { ctx } ) => {
		try {
			let [ online, offline, total ] = [ 0, 0, 0 ];
			for( const instanceData of Object.values( await getAllServerWithPermission( ctx.userClass ) ) ) {
				total++;
				if( instanceData.State.IsListen ) {
					online++;
					continue;
				}
				offline++;
			}
			return [ online, offline, total ];
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	systemUsage: authProcedure.query( async() => {
		try {
			return ( await MongoUsage.findOne( {} ) )!.toJSON() as SystemUsage;
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );
