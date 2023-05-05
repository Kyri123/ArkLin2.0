import type { Socket } from "socket.io";
import type {
	EmitEvents,
	ListenEvents
}                      from "@app/Types/Socket";
import fs              from "fs";

let watchedFile : fs.StatWatcher | null = null;

const watchPanelLog = () => {
	SocketIO.in( "panelLog" ).emit( "OnPanelLogUpdated", fs
		.readFileSync( __LogFile )
		.toString()
		.split( "\n" )
		.reverse() );

	if ( SocketIO.sockets.adapter.rooms.has( "panelLog" ) && SocketIO.sockets.adapter.rooms.get( "panelLog" )!.size > 0 ) {
		if ( !watchedFile ) {
			SystemLib.Log( "watcher", "Adding watch for panel log" );
			watchedFile = fs.watchFile( __LogFile, { interval: 1000 }, ( curr, prev ) => {
				if ( curr.ctime !== prev.ctime ) {
					SocketIO.in( "panelLog" ).emit( "OnPanelLogUpdated", fs
						.readFileSync( __LogFile )
						.toString()
						.split( "\n" )
						.reverse() );
				}
			} );
		}
	}
	else if ( watchedFile ) {
		SystemLib.Log( "watcher", "Removing watch for panel log" );
		fs.unwatchFile( __LogFile );
		watchedFile.removeAllListeners();
		watchedFile = null;
	}
};

const Connection = async(
	socket : Socket<ListenEvents, EmitEvents>
) => {
	const query = socket.handshake.query;
	const roomName = query.roomName;
	if ( !roomName || Array.isArray( roomName ) ) {
		return;
	}
	socket.once( "disconnect", () => {
		watchPanelLog();
	} );

	socket.join( roomName );
	watchPanelLog();
};

SocketIO.on( "connection", Connection );