import type { ServerStatus } from "@app/Types/ArkSE";
import * as dgram from "dgram";
import { Rcon } from "rcon-client";
import { ServerLib } from "./server.Lib";


const socket = dgram.createSocket( "udp4" );
socket.bind( parseInt( process.env.API_GAMEDIG_UDP || "33333" ) );

export async function queryArkServer( Server: ServerLib ): Promise<ServerStatus> {
	return await new Promise<ServerStatus>( resolve => {
		const reso: ServerStatus = {
			Online: false,
			Players: []
		};

		socket.send( Buffer.from( [ 0xff, 0xff, 0xff, 0xff, 0x55, 0xff, 0xff, 0xff, 0xff ] ), Server.get.ArkmanagerCfg.ark_QueryPort, SERVERIP, Err => {
			if( Err ) {
				clearTimeout( timeout );
				socket.removeAllListeners();
				resolve( reso );
			}

			socket.once( "message", message => {
				reso.Online = true;

				socket.send( Buffer.from( [ 0xff, 0xff, 0xff, 0xff, 0x55, ...message.slice( 5 ) ] ), Server.get.ArkmanagerCfg.ark_QueryPort, SERVERIP, Err => {
					if( Err ) {
						clearTimeout( timeout );
						socket.removeAllListeners();
						resolve( reso );
					}

					socket.once( "message", msg => {
						reso.Players = parsePlayerList( msg );
						socket.removeAllListeners();
						resolve( reso );
					} );
				} );
			} );
		} );

		const timeout = setTimeout( () => {
			socket.removeAllListeners();
			resolve( reso );
		}, 2000 );

		socket.on( "error", () => {
			clearTimeout( timeout );
			resolve( reso );
		} );
	} );
}

function parsePlayerList( buffer: Buffer ): string[] {
	let hexData = buffer.toString( "hex" );
	const nameArray: string[] = [];

	for( let i = 0; i < hexData.length; i += 2 ) {
		if( hexData.slice( i, i + 2 ) === "00" ) {
			const buffer = Buffer.from( hexData.slice( 0, i ), "hex" );
			const name = buffer.toString( "utf8" );
			nameArray.push( name );
			hexData = hexData.slice( i + 2 );
			i = -2;
		}
	}

	const clearNameArray: string[] = [];
	for( let i = 0; i < nameArray.length; i++ ) {
		if( nameArray[ i ].trim() !== "" && !JSON.stringify( nameArray[ i ] ).includes( ",/FF" ) && !JSON.stringify( nameArray[ i ] ).includes( "\\u" ) && !/\uFFFD/g.test( nameArray[ i ] ) ) {
			clearNameArray.push( nameArray[ i ] );
		}
	}

	return clearNameArray;
}

export async function sendCommand(
	Instance: string,
	Command: string
): Promise<{ Response: string, Successfuly: boolean }> {
	const response = {
		Response: "Server ist nicht vorhanden!",
		Successfuly: false
	};
	const server = await ServerLib.build( Instance );
	if( server.isValid() && global.SERVERIP ) {
		const config = server.getConfig();
		const state = await server.getState();
		if( config.ark_RCONPort && config.ark_RCONEnabled && state.IsListen ) {
			try {
				const rcon = await Rcon.connect( {
					host: SERVERIP,
					port: config.ark_RCONPort,
					password: config.ark_ServerAdminPassword
				} );

				response.Response = await rcon.send( Command );
				response.Successfuly = true;
			} catch( e ) {
				SystemLib.debugLog( "RCON", e );
				response.Response = "Konnte keine verbindung zum RCON aufbauen.";
			}
		} else {
			response.Response = "Server Offline oder RCON falsch Konfiguriert.";
		}
	}
	return response;
}
