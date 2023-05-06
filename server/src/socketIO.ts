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
	for ( const key of SocketIO.sockets.adapter.rooms.keys() ) {
		if ( key.startsWith( __basedir ) && fs.existsSync( key ) && !watchedFile.has( key ) && ( key.endsWith( ".log" ) || key.endsWith( ".txt" ) ) ) {
			const watcher = fs.watch( key, ( event, path ) => {
				if ( event === "change" ) {
					SocketIO.in( key ).emit( "onFileUpdated", key, fs
						.readFileSync( key )
						.toString()
						.split( "\n" )
						.reverse() );
				}
				else if ( event === "rename" ) {
					if ( !SocketIO.sockets.adapter.rooms.has( path ) ) {
						watcher.close();
						SystemLib.Log( "watcher", "Close watching file " + BC( "Green" ), path );
						watchedFile.delete( key );
					}
				}
			} );

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
		else {
			SystemLib.DebugLog( "watcher", "EmitFileWatch " + BC( "Green" ), file );
			SocketIO.in( file ).emit( "onFileUpdated", file, fs
				.readFileSync( file )
				.toString()
				.split( "\n" )
				.reverse() );
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

	socket.join( roomName );

	watchPanelLog();
};

SocketIO.on( "connection", Connection );