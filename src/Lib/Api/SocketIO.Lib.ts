import { io } from "socket.io-client";


export class SocketIOLib {
	static getSocketHost(): string {
		if( !process.env.NODE_ENV || process.env.NODE_ENV === "development" ) {
			return "http://85.214.47.99:26080/";
		}
		return "/";
	}

	static getSocket( roomName: string ) {
		return io( SocketIOLib.getSocketHost(), { query: { roomName } } );
	}
}
