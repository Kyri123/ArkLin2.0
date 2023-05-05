import type { Socket } from "socket.io-client";
import io              from "socket.io-client";
import type {
	EmitEvents,
	ListenEvents
}                      from "@app/Types/Socket";
import { SocketIOLib } from "@app/Lib/Api/SocketIO.Lib";

export const GetSocket = ( roomName : string ) : Socket<ListenEvents, EmitEvents> => io( SocketIOLib.GetSpocketHost(), {
	query: {
		roomName
	}
} );