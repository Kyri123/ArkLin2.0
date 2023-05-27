import { createServer } from "@/server/src/Lib/server.Lib";
import { EArkmanagerCommands } from "@app/Lib/serverUtils";
import { panelConfigSchema } from "@server/Lib/zodSchema";
import type { Instance } from "@server/MongoDB/MongoInstances";
import MongoInstances from "@server/MongoDB/MongoInstances";
import {
	authProcedure,
	handleTRCPErr,
	permissionMiddleware,
	router,
	serverProcedure
} from "@server/trpc/trpc";
import {
	EPerm,
	EPermServer
} from "@shared/Enum/User.Enum";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const authServerAction = router( {
	executeCommand: serverProcedure.use( permissionMiddleware( EPermServer.ExecuteActions ) ).input( z.object( {
		command: z.nativeEnum( EArkmanagerCommands ),
		params: z.array( z.string() )
	} ) ).mutation( async( { ctx, input } ) => {
		const { server } = ctx;
		const { command, params } = input;
		try {
			await server.executeCommand( command, params );
			return "Befehl wurde an den Server gesendet";
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),


	killAction: serverProcedure.input( z.object( {
		killServer: z.boolean().optional()
	} ) ).mutation( async( { ctx, input } ) => {
		const { server } = ctx;
		const { killServer } = input;
		try {
			const state = server.getState();
			const PID = killServer ? state.ArkserverPID : state.ArkmanagerPID;
			if( PID >= 10 ) {
				await sshManagerLib.exec( "kill", [ PID.toString() ] ).catch( () => {
				} );
				await TManager.runTask( "ServerState", true );
				return killServer ? "Server wurde beendet!" : "Arkmanager aktion wurde beendet!";
			}
			throw new TRPCError( { message: "Keine Aktion in gang!", code: "INTERNAL_SERVER_ERROR" } );
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),


	removeServer: serverProcedure.use( permissionMiddleware( EPerm.ManageServers ) ).mutation( async( { ctx } ) => {
		const { server } = ctx;
		try {
			await server.removeServer();
			await TManager.runTask( "ServerState", true );
			return "Server wurde entfernt!";
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),


	updatePanelConfig: serverProcedure.use( permissionMiddleware( EPerm.ManageServers ) ).input( z.object( {
		config: panelConfigSchema
	} ) ).mutation( async( {
		ctx,
		input
	} ) => {
		const { server } = ctx;
		const { config } = input;
		try {
			await server.setPanelConfig( config );
			await TManager.runTask( "ServerState", true );
			return "Panel config wurde bearbeitet!";
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),


	createServer: authProcedure.use( permissionMiddleware( EPerm.ManageServers ) ).input( z.object( {
		config: panelConfigSchema
	} ) ).mutation( async( { input } ) => {
		const { config } = input;
		try {
			const allServers = await MongoInstances.find<Instance>();
			const queryPorts = allServers.map( s => s.ArkmanagerCfg.ark_QueryPort );
			const gamePorts = allServers.map( s => s.ArkmanagerCfg.ark_Port ).concat( allServers.map( s => s.ArkmanagerCfg.ark_QueryPort + 1 ) );
			const rconPorts = allServers.map( s => s.ArkmanagerCfg.ark_RCONPort );

			let arkQueryPort = 27015;
			let arkPort = 7778;
			let arkRCONPort = 29020;

			while( queryPorts.includes( arkQueryPort ) ) {
				arkQueryPort++;
			}

			while( gamePorts.includes( arkPort ) ) {
				arkPort += 2;
			}

			while( rconPorts.includes( arkRCONPort ) ) {
				arkRCONPort++;
			}

			const server = await createServer( config, undefined, {
				ark_Port: arkPort,
				ark_QueryPort: arkQueryPort,
				ark_RCONPort: arkRCONPort
			} );
			await TManager.runTask( "ServerState", true );

			if( server?.isValid() ) {
				return "Ark-Server wurde erfolgreich erstellt";
			}
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );
