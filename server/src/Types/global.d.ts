import * as core              from "express-serve-static-core";
import { Server }             from "socket.io";
import { DefaultEventsMap }   from "socket.io/dist/typed-events";
import * as http              from "http";
import {
	IEmitEvents,
	IListenEvents
}                             from "../../../src/Shared/Type/Socket";
import "./Types";
import { SystemLib_Class }    from "../Lib/System.Lib";
import { ConfigManagerClass } from "../Lib/ConfigManager.Lib";
import { TaskManagerClass }   from "../Tasks/TaskManager";
import { SSHLib }             from "../Lib/SSH.Lib";

export declare global {
	var Api : core.Express;
	var HttpServer : http.Server<
		typeof http.IncomingMessage,
		typeof http.ServerResponse
	>;
	var SocketIO : Server<IListenEvents, IEmitEvents, DefaultEventsMap, any>;
	//var RedisClient : RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
	var TManager : TaskManagerClass;
	var CManager : ConfigManagerClass;
	var SystemLib : SystemLib_Class;
	var SSHManagerLib : SSHLib;
	var __AppToken : string | undefined;
	var __basedir : string;
	var __configdir : string;
	var __PackageJson : PackageJson;
	var __LogFile : string;
	var __LogDir : string;
	var __server_dir : string;
	var __git_dir : string;
	var __server_arkmanager : string;
	var __server_logs : string;
	var __server_backups : string;
	var __SteamCMD : string;
	var __PublicIP : string;
	var __PANNELUPDATE : boolean;

	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV : "development" | "production" | string;
			MONGODB_PORT : string;
			MONGODB_HOST : string;
			MONGODB_USER : string;
			MONGODB_PASSWD : string;
			MONGODB_DATABASE : string;
			MARIADB_HOST : string;
			MARIADB_PORT : string;
			MARIADB_DATABASE : string;
			MARIADB_USER : string;
			MARIADB_PASSWORD : string;
			REDIS_PORT : string;
			REDIS_HOST : string;
			REDIS_PASSWORD : string;
			API_GAMEDIG_UDP : string;
			API_EXPRESS_HTTP_PORT : string;
			APPEND_BASEDIR : string;
		}
	}
}
