import dgram            from "dgram";
import process          from "process";
import { ServerLib }    from "./Server.Lib";
import { Rcon }         from "rcon-client";
import * as console     from "console";
import { IOnlineUsers } from "../../../src/Shared/Type/ArkSE";


const client = dgram.createSocket( "udp4" );
client.bind( parseInt( process.env.API_GAMEDIG_UDP || "33333" ) + 10 );
client.on( "error", console.error );

export async function IsServerOnline( Port : number, Timeout = 5000 ) : Promise<boolean> {
	return new Promise<boolean>( resolve => {
		const OnMessage = ( msg, rinfo ) => {
			SystemLib.DebugLog( "[UDP] MESSAGE:", rinfo, msg );
			clearTimeout( TimeoutTimer );

			client.removeListener( "message", OnMessage );
			client.removeListener( "error", OnError );

			resolve( true );
		};

		const OnError = ( err ) => {
			SystemLib.LogError( "[UDP] ERROR:", err );
		};

		let TimeoutTimer : NodeJS.Timeout | undefined = setTimeout( () => {
			SystemLib.DebugLog( "[UDP] TIMEOUT!", Port, Timeout );
			TimeoutTimer = undefined;

			client.removeListener( "message", OnMessage );
			client.removeListener( "error", OnError );

			resolve( false );
		}, Timeout )
		try {
			client.on( "message", OnMessage );
			client.on( 'error', OnError );

			const message = Buffer.from( [
				255, 255, 255, 255, 84, 83, 111,
				117, 114, 99, 101, 32, 69, 110,
				103, 105, 110, 101, 32, 81, 117,
				101, 114, 121, 0
			] );

			client.send( message, 0, message.length, Port, __PublicIP );
		}
		catch ( e ) {
			console.error( e );
			if ( TimeoutTimer ) {
				clearTimeout( TimeoutTimer );
			}

			client.removeListener( "message", OnMessage );
			client.removeListener( "error", OnError );

			resolve( false );
		}
	} );
}

export async function GetOnlinePlayer( Instance : string ) : Promise<IOnlineUsers[]> {
	const Return : IOnlineUsers[] = [];
	const Resp = await SendCommand( Instance, "listplayers" );
	if ( Resp.Successfuly && Resp.Response.toLowerCase().trim().replaceAll( " ", "" ) !== "noplayersconnected" ) {
		const RawArray = Resp.Response.split( "\n" ).filter( e => e.replaceAll( " ", "" ).trim() !== "" );
		for ( let Idx = 0; Idx < RawArray.length; ++Idx ) {
			const [ Username, SteamID ] : any[] = RawArray[ Idx ].split( "," );
			Return.push( {
				Username: Username.slice( Idx.toString().length + 2, Username.length ),
				SteamID: parseInt( SteamID )
			} );
		}
	}
	return Return;
}

export async function SendCommand( Instance : string, Command : string ) : Promise<{ Response : string, Successfuly : boolean }> {
	const Response = {
		Response: "Server ist nicht vorhanden!",
		Successfuly: false
	};
	const Server = new ServerLib( Instance );
	if ( await Server.Init() && global.__PublicIP ) {
		const Config = Server.GetConfig();
		const State = await Server.GetState();
		if ( Config.ark_RCONPort && Config.ark_RCONEnabled && State.IsListen ) {
			try {
				const rcon = await Rcon.connect( {
					host: __PublicIP, port: Config.ark_RCONPort, password: Config.ark_ServerAdminPassword
				} )

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