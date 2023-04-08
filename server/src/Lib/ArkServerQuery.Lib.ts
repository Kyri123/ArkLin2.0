import { ServerLib }     from "./Server.Lib";
import { Rcon }          from "rcon-client";
import { IServerStatus } from "../../../src/Shared/Type/ArkSE";
import Gamedig           from "gamedig";
import * as console      from "console";

const GamedigQuery = new Gamedig( { listenUdpPort: parseInt( process.env.API_GAMEDIG_UDP || "33333" ) } );

export async function QueryArkServer( Server : ServerLib<true> ) : Promise<IServerStatus> {
	if ( __PublicIP !== "0.0.0.0" ) {
		try {
			const QueryResult = await GamedigQuery.query( {
				type: "arkse",
				host: __PublicIP,
				port: Server.Get.ArkmanagerCfg.ark_QueryPort
			} );

			return {
				Online: true,
				Players: QueryResult.players.map<string>( E => E.name! )
			};
		}
		catch ( e ) {
			console.error( e );
		}
	}

	return {
		Online: false,
		Players: []
	};
}

export async function SendCommand(
	Instance : string,
	Command : string
) : Promise<{ Response : string; Successfuly : boolean }> {
	const Response = {
		Response: "Server ist nicht vorhanden!",
		Successfuly: false
	};
	const Server = await ServerLib.build( Instance );
	if ( Server.IsValid() && global.__PublicIP ) {
		const Config = Server.GetConfig();
		const State = await Server.GetState();
		if ( Config.ark_RCONPort && Config.ark_RCONEnabled && State.IsListen ) {
			try {
				const rcon = await Rcon.connect( {
					host: __PublicIP,
					port: Config.ark_RCONPort,
					password: Config.ark_ServerAdminPassword
				} );

				Response.Response = await rcon.send( Command );
				Response.Successfuly = true;
			}
			catch ( e ) {
				SystemLib.DebugLog( "[RCON]", e );
				Response.Response = "Konnte keine verbindung zum RCON aufbauen.";
			}
		}
		else {
			Response.Response = "Server Offline oder RCON falsch Konfiguriert.";
		}
	}
	return Response;
}
