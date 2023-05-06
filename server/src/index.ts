import "@kyri123/k-javascript-utils/lib/useAddons";
import "./InitDirs";
import { InstallRoutings } from "./Init";
import * as path           from "path";
import "./Lib/System.Lib";
import type {
	Request,
	Response
}                          from "express";
import express             from "express";
import * as http           from "http";
import { Server }          from "socket.io";
import * as process        from "process";
import fs                  from "fs";
import {
	ConfigManager,
	SSHManager
}                          from "./Lib/ConfigManager.Lib";
import * as mongoose       from "mongoose";
import AccountKey          from "./MongoDB/DB_AccountKey";
import DB_AccountKey       from "./MongoDB/DB_AccountKey";
import DB_Accounts         from "./MongoDB/DB_Accounts";
import TaskManager         from "./Tasks/TaskManager";
import { RunTest }         from "./Testing";
import fetch               from "node-fetch";
import { BC }              from "@server/Lib/System.Lib";
import type {
	EmitEvents,
	ListenEvents
}                          from "@app/Types/Socket";

"asdasd".contains( "asd" );

// Small fix if the cert fails!
process.env.NODE_TLS_REJECT_UNAUTHORIZED = String( 0 );
global.__PANNELUPDATE = false;

const Files = fs.readdirSync( __LogDir );
Files.sort( ( a, b ) => {
	const A = Number( a.replaceAll( ".log", "" ) );
	const B = Number( b.replaceAll( ".log", "" ) );
	return A < B ? 1 : -1;
} );
Files.splice( 0, ConfigManager.GetDashboardConifg.LOG_MaxLogCount );
for ( const LogFile of Files ) {
	SystemLib.LogWarning( "log",
		"Remove Logfile because its over the limit:",
		BC( "Red" ),
		LogFile
	);
	fs.rmSync( path.join( __LogDir, LogFile ) );
}

global.Api = express();
global.HttpServer = http.createServer( Api );
global.SocketIO = new Server<ListenEvents, EmitEvents>( HttpServer, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
} );

// Api should use JsonOnly!
Api.use( express.json() );
Api.use( express.static( path.join( __basedir, "build" ) ) );

Api.use( function( req, res, next ) {
	res.setHeader( "Access-Control-Allow-Origin", "*" );
	res.setHeader( "Access-Control-Allow-Methods", "GET, POST" );
	res.setHeader(
		"Access-Control-Allow-Headers",
		"X-Requested-With,content-type"
	);
	res.setHeader( "Access-Control-Allow-Credentials", "true" );
	next();
} );

InstallRoutings( path.join( __dirname, "Routings" ), Api );

mongoose
	.connect(
		`mongodb://${ process.env.MONGODB_HOST }:${ process.env.MONGODB_PORT }`,
		{
			user: process.env.MONGODB_USER,
			pass: process.env.MONGODB_PASSWD
		}
	)
	.then( async() => {
		SystemLib.Log( "socketio", "Install socket listener" );

		await import("@server/socketIO");

		Api.use( "*", ( req : Request, res : Response ) => res.sendFile( path.join( __basedir, "build/index.html" ) ) );

		if ( ConfigManager.GetDashboardConifg.PANEL_ArkServerIp.clearWs() !== "" ) {
			global.__PublicIP = ConfigManager.GetDashboardConifg.PANEL_ArkServerIp.clearWs();
		}
		else {
			const IPResponse = await fetch( "http://api.ipify.org" );
			global.__PublicIP = ( await IPResponse.text() ).clearWs();
			SystemLib.Log( "ip", "Public IP: " + global.__PublicIP );
		}

		await import( "@server/trpc/server" );
		await SSHManager.Init();
		// create an account key if no there and no user
		if (
			( await DB_Accounts.count() ) <= 0 &&
			( await DB_AccountKey.count() ) <= 0
		) {
			await AccountKey.create( {
				key: "KAdmin-ArkLIN2",
				asSuperAdmin: true
			} );
			SystemLib.Log(
				"DB", "Create default AccountKey:" + SystemLib.ToBashColor( "Red" ),
				"KAdmin-ArkLIN2"
			);
		}


		// start Tasks
		await TaskManager.Init();
		SystemLib.Log(
			"TASKS", `All Jobs init (Total: ${ Object.keys( TaskManager.Jobs ).length })`
		);

		SystemLib.Log( "DB", "Connected... Start API and SOCKETIO" );
		HttpServer.listen( process.env.API_EXPRESS_HTTP_PORT, () =>
			SystemLib.Log(
				"API/SOCKETIO", "API listen on port",
				process.env.API_EXPRESS_HTTP_PORT
			)
		);
		await RunTest();
	} );