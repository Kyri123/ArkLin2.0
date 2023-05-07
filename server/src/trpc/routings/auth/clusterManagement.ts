import {
	authProcedure,
	handleTRCPErr,
	permissionMiddleware,
	router
}                                       from "@server/trpc/trpc";
import { TRPCError }                    from "@trpc/server";
import { EPerm }                        from "@shared/Enum/User.Enum";
import type { Cluster }                 from "@server/MongoDB/DB_Cluster";
import DB_Cluster, { ZodClusterSchema } from "@server/MongoDB/DB_Cluster";
import { z }                            from "zod";
import path                             from "path";
import fs                               from "fs";
import { ServerLib }                    from "@server/Lib/Server.Lib";

export const clusterProcedure = authProcedure.use( permissionMiddleware( EPerm.ManageCluster ) );

export const auth_clusterManagement = router( {
	getAllCluster: clusterProcedure.query( async() => {
		try {
			return await DB_Cluster.find<Cluster>( {} );
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	createCluster: clusterProcedure.input( z.object( {
		data: ZodClusterSchema
	} ) ).mutation( async( { input } ) => {
		const { data } = input;
		try {
			await DB_Cluster.create( data );
			await TManager.RunTask( "ServerState", true );
			return "Cluster wurde erstellt";
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	editCluster: clusterProcedure.input( z.object( {
		id: z.string(),
		data: ZodClusterSchema
	} ) ).mutation( async( { input } ) => {
		const { id, data } = input;
		try {
			console.log( input );
			await DB_Cluster.findByIdAndUpdate( id, data );
			TManager.RunTask( "ServerState", true ).then( () => {
			} );
			TManager.RunTask( "Server", true ).then( () => {
			} );
			return "Cluster wurde bearbeitet";
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	removeCluster: clusterProcedure.input( z.string() ).mutation( async( { input } ) => {
		try {
			await DB_Cluster.findByIdAndDelete( input );
			await TManager.RunTask( "ServerState", true );
			return "Cluster wurde gelöscht";
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	wipeCluster: clusterProcedure.input( z.string() ).mutation( async( { input } ) => {
		try {
			const cluster = await DB_Cluster.findById( input );
			if ( cluster ) {
				for ( const Instance of cluster.Instances ) {
					const server = await ServerLib.build( Instance );
					if ( server?.IsValid() ) {
						await server.Wipe();
					}
				}
				fs.rmSync( path.join( __cluster_dir, cluster._id.toString() ), { recursive: true, force: true } );
				return "Cluster wurde ge-wiped und alle Server runtergefahren";
			}
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );