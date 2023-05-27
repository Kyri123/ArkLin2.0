/* eslint-disable @typescript-eslint/naming-convention */
import type { ConfigManagerClass } from "@/server/src/Lib/configManager.Lib";
import type { SSHLib } from "@/server/src/Lib/ssh.Lib";
import type { SystemLibClass } from "@/server/src/Lib/system.Lib";
import type {
	EmitEvents,
	ListenEvents
} from "@app/Types/Socket";
import type * as core from "express-serve-static-core";
import type * as http from "http";
import type { Server } from "socket.io";
import type { DefaultEventsMap } from "socket.io/dist/typed-events";
import type { TaskManagerClass } from "../Tasks/taskManager";
import "./Types";


export declare global {
	var Api: core.Express;
	var HTTPSERVER: http.Server<
		typeof http.IncomingMessage,
		typeof http.ServerResponse
	>;
	var SocketIO: Server<ListenEvents, EmitEvents, DefaultEventsMap, any>;
	var TManager: TaskManagerClass;
	var CManager: ConfigManagerClass;
	var SystemLib: SystemLibClass;
	var sshManagerLib: SSHLib;
	var APPTOKEN: string | undefined;
	var BASEDIR: string;
	var CONFIGDIR: string;
	var PACKAGE: PackageJson;
	var LOGFILE: string;
	var LOGDIR: string;
	var SERVERDIR: string;
	var CLUSTERDIR: string;
	var GITDIR: string;
	var SERVERARKMANAGER: string;
	var SERVERLOGSDIR: string;
	var SERVERBACKUPDIR: string;
	var STEAMCMDDIR: string;
	var SERVERIP: string;
	var PANELUPDATE: boolean;

	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: "development" | "production" | string,
			MONGODB_PORT: string,
			MONGODB_HOST: string,
			MONGODB_USER: string,
			MONGODB_PASSWD: string,
			MONGODB_DATABASE: string,
			API_GAMEDIG_UDP: string,
			API_EXPRESS_HTTP_PORT: string,
			APPEND_BASEDIR: string
		}
	}
}
