import {
	authProcedure,
	handleTRCPErr,
	permissionMiddleware,
	router,
	serverProcedure
}                              from "@server/trpc/trpc";
import { TRPCError }           from "@trpc/server";
import { z }                   from "zod";
import { EArkmanagerCommands } from "@app/Lib/serverUtils";
import { EPerm }               from "@shared/Enum/User.Enum";
import { PanelConfigSchema }   from "@server/Lib/zodSchema";
import type { Instance }       from "@server/MongoDB/DB_Instances";
import DB_Instances            from "@server/MongoDB/DB_Instances";
import { CreateServer }        from "@server/Lib/Server.Lib";


export const auth_serverAction = router( {
	executeCommand: serverProcedure.input( z.object( {
		command: z.nativeEnum( EArkmanagerCommands ),
		params: z.array( z.string() )
	} ) ).mutation( async( { ctx, input } ) => {
		const { server } = ctx;
		const { command, params } = input;
		try {
			await server.ExecuteCommand( command, params );
			return "Befehl wurde an den Server gesendet";
		}
		catch ( e ) {
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
			const State = server.GetState();
			const PID = killServer ? State.ArkserverPID : State.ArkmanagerPID;
			if ( PID >= 10 ) {
				await SSHManagerLib.Exec( "kill", [ PID.toString() ] ).catch();
				await TManager.RunTask( "ServerState", true );
				return killServer ? "Server wurde beendet!" : "Arkmanager aktion wurde beendet!";
			}
			throw new TRPCError( { message: "Keine Aktion in gang!", code: "INTERNAL_SERVER_ERROR" } );
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),


	removeServer: serverProcedure.use( permissionMiddleware( EPerm.ManageServers ) ).mutation( async( { ctx } ) => {
		const { server } = ctx;
		try {
			await server.RemoveServer();
			await TManager.RunTask( "ServerState", true );
			return "Server wurde entfernt!";
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),


	updatePanelConfig: serverProcedure.use( permissionMiddleware( EPerm.ManageServers ) ).input( z.object( {
		config: PanelConfigSchema
	} ) ).mutation( async( {
		ctx,
		input
	} ) => {
		const { server } = ctx;
		const { config } = input;
		try {
			await server.SetPanelConfig( config );
			await TManager.RunTask( "ServerState", true );
			return "Panel config wurde bearbeitet!";
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),


	createServer: authProcedure.use( permissionMiddleware( EPerm.ManageServers ) ).input( z.object( {
		config: PanelConfigSchema
	} ) ).mutation( async( { input } ) => {
		const { config } = input;
		try {
			const allServers = await DB_Instances.find<Instance>();
			const QueryPorts = allServers.map( s => s.ArkmanagerCfg.ark_QueryPort );
			const GamePorts = allServers.map( s => s.ArkmanagerCfg.ark_Port ).concat( allServers.map( s => s.ArkmanagerCfg.ark_QueryPort + 1 ) );
			const RconPorts = allServers.map( s => s.ArkmanagerCfg.ark_RCONPort );

			let ark_QueryPort = 27015;
			let ark_Port = 7778;
			let ark_RCONPort = 29020;

			while ( QueryPorts.includes( ark_QueryPort ) ) {
				ark_QueryPort++;
			}

			while ( GamePorts.includes( ark_Port ) ) {
				ark_Port += 2;
			}

			while ( RconPorts.includes( ark_RCONPort ) ) {
				ark_RCONPort++;
			}

			const server = await CreateServer( config, undefined, {
				ark_Port,
				ark_QueryPort,
				ark_RCONPort
			} );
			await TManager.RunTask( "ServerState", true );

			if ( server?.IsValid() ) {
				return "Ark-Server wurde erfolgreich erstellt";
			}
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );