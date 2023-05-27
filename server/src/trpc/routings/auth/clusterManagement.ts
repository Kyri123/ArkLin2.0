import { ServerLib } from "@/server/src/Lib/server.Lib";
import type { Cluster } from "@server/MongoDB/MongoCluster";
import MongoCluster, { zodClusterSchema } from "@server/MongoDB/MongoCluster";
import {
	authProcedure,
	handleTRCPErr,
	permissionMiddleware,
	router
} from "@server/trpc/trpc";
import { EPerm } from "@shared/Enum/User.Enum";
import { TRPCError } from "@trpc/server";
import fs from "fs";
import path from "path";
import { z } from "zod";


export const clusterProcedure = authProcedure.use( permissionMiddleware( EPerm.ManageCluster ) );

export const authClusterManagement = router( {
	getAllCluster: clusterProcedure.query( async() => {
		try {
			return await MongoCluster.find<Cluster>( {} );
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	createCluster: clusterProcedure.input( z.object( {
		data: zodClusterSchema
	} ) ).mutation( async( { input } ) => {
		const { data } = input;
		try {
			await MongoCluster.create( data );
			await TManager.runTask( "ServerState", true );
			return "Cluster wurde erstellt";
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	editCluster: clusterProcedure.input( z.object( {
		id: z.string(),
		data: zodClusterSchema
	} ) ).mutation( async( { input } ) => {
		const { id, data } = input;
		try {
			await MongoCluster.findByIdAndUpdate( id, data );
			TManager.runTask( "ServerState", true ).then( () => {
			} );
			TManager.runTask( "Server", true ).then( () => {
			} );
			return "Cluster wurde bearbeitet";
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	removeCluster: clusterProcedure.input( z.string() ).mutation( async( { input } ) => {
		try {
			await MongoCluster.findByIdAndDelete( input );
			await TManager.runTask( "ServerState", true );
			return "Cluster wurde gelöscht";
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	wipeCluster: clusterProcedure.input( z.string() ).mutation( async( { input } ) => {
		try {
			const cluster = await MongoCluster.findById( input );
			if( cluster ) {
				for( const instance of cluster.Instances ) {
					const server = await ServerLib.build( instance );
					if( server?.isValid() ) {
						await server.wipe();
					}
				}
				fs.rmSync( path.join( CLUSTERDIR, cluster._id.toString() ), { recursive: true, force: true } );
				return "Cluster wurde ge-wiped und alle Server runtergefahren";
			}
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );
