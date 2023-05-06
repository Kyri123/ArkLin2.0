import { ServerLib }    from "./Server.Lib";
import { Rcon }         from "rcon-client";
import * as dgram       from "dgram";
import type { ServerStatus } from "@app/Types/ArkSE";


const socket = dgram.createSocket( "udp4" );
socket.bind( parseInt( process.env.API_GAMEDIG_UDP || "33333" ) );

export async function QueryArkServer( Server : ServerLib<true> ) : Promise<ServerStatus> {
	return await new Promise<ServerStatus>( ( resolve ) => {
		const Reso : ServerStatus = {
			Online: false,
			Players: []
		};

		socket.send( Buffer.from( [ 0xff, 0xff, 0xff, 0xff, 0x55, 0xff, 0xff, 0xff, 0xff ] ), Server.Get.ArkmanagerCfg.ark_QueryPort, __PublicIP, Err => {
			if ( Err ) {
				clearTimeout( Timeout );
				socket.removeAllListeners();
				resolve( Reso );
			}

			socket.once( "message", ( message ) => {
				Reso.Online = true;

				socket.send( Buffer.from( [ 0xff, 0xff, 0xff, 0xff, 0x55, ...message.slice( 5 ) ] ), Server.Get.ArkmanagerCfg.ark_QueryPort, __PublicIP, Err => {
					if ( Err ) {
						clearTimeout( Timeout );
						socket.removeAllListeners();
						resolve( Reso );
					}

					socket.once( "message", ( msg ) => {
						Reso.Players = parsePlayerList( msg );
						socket.removeAllListeners();
						resolve( Reso );
					} );
				} );
			} );
		} );

		const Timeout = setTimeout( () => {
			socket.removeAllListeners();
			resolve( Reso );
		}, 2000 );

		socket.on( "error", () => {
			clearTimeout( Timeout );
			resolve( Reso );
		} );
	} );
}

function parsePlayerList( buffer : Buffer ) : string[] {
	let hexData = buffer.toString( "hex" );
	const nameArray : string[] = [];

	for ( let i = 0; i < hexData.length; i += 2 ) {
		if ( hexData.slice( i, i + 2 ) === "00" ) {
			const Buf = Buffer.from( hexData.slice( 0, i ), "hex" );
			const name = Buf.toString( "utf8" );
			nameArray.push( name );
			hexData = hexData.slice( i + 2 );
			i = -2;
		}
	}

	const ClearNameArray : string[] = [];
	for ( let i = 0; i < nameArray.length; i++ ) {
		if ( nameArray[ i ].trim() !== "" && !JSON.stringify( nameArray[ i ] ).includes( ",/FF" ) && !JSON.stringify( nameArray[ i ] ).includes( "\\u" ) && !/\uFFFD/g.test( nameArray[ i ] ) ) {
			ClearNameArray.push( nameArray[ i ] );
		}
	}

	return ClearNameArray;
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
				SystemLib.DebugLog( "RCON", e );
				Response.Response = "Konnte keine verbindung zum RCON aufbauen.";
			}
		}
		else {
			Response.Response = "Server Offline oder RCON falsch Konfiguriert.";
		}
	}
	return Response;
}
