import type { Socket }    from "socket.io";
import type {
	EmitEvents,
	ListenEvents
}                         from "@app/Types/Socket";
import type { FSWatcher } from "fs";
import fs                 from "fs";
import { BC }             from "@server/Lib/System.Lib";

const watchedFile : Map<string, FSWatcher> = new Map();

const watchPanelLog = () => {
	SocketIO.in( "panelLog" ).emit( "OnPanelLogUpdated", fs
		.readFileSync( __LogFile )
		.toString()
		.split( "\n" )
		.reverse() );

	for ( const key of SocketIO.sockets.adapter.rooms.keys() ) {
		if ( key.startsWith( "/" ) && fs.existsSync( key ) && !watchedFile.has( key ) ) {
			const watcher = fs.watch( __LogFile, ( event, path ) => {
				if ( event === "change" ) {
					SocketIO.in( path ).emit( "OnPanelLogUpdated", fs
						.readFileSync( __LogFile )
						.toString()
						.split( "\n" )
						.reverse() );
				}
				else if ( event === "rename" ) {
					if ( !SocketIO.sockets.adapter.rooms.has( path ) ) {
						watcher.close();
						SystemLib.Log( "watcher", "Close watching file " + BC( "Green" ), path );
						watchedFile.delete( path );
					}
				}
			} );

			SocketIO.in( key ).emit( "OnPanelLogUpdated", fs
				.readFileSync( __LogFile )
				.toString()
				.split( "\n" )
				.reverse() );

			SystemLib.Log( "watcher", "Start watching file " + BC( "Green" ), key );
			watchedFile.set( key, watcher );
		}
	}

	for ( const [ file, watcher ] of watchedFile.entries() ) {
		if ( !SocketIO.sockets.adapter.rooms.has( file ) || ( SocketIO.sockets.adapter.rooms.get( file )?.size || 0 ) <= 0 ) {
			SystemLib.Log( "watcher", "Close watching file " + BC( "Green" ), file );
			watcher.close();
			watchedFile.delete( file );
		}
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

	if ( roomName === "panelLog" ) {
		socket.join( __LogFile );
	}
	else {
		socket.join( roomName );
	}

	watchPanelLog();
};

SocketIO.on( "connection", Connection );