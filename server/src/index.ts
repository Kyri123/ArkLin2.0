import { BC } from "@/server/src/Lib/system.Lib";
import { createHttpServer, installErrorHandler } from "@/server/src/trpc/middleware";
import "@kyri123/k-javascript-utils/lib/useAddons";
import type {
	Request,
	Response
} from "express";
import fs from "fs";
import * as mongoose from "mongoose";
import fetch from "node-fetch";
import * as path from "path";
import * as process from "process";
import {
	configManager,
	sshManager
} from "./Lib/configManager.Lib";
import "./Lib/system.Lib";
import { default as AccountKey, default as MongoAccountKey } from "./MongoDB/MongoAccountKey";
import MongoAccounts from "./MongoDB/MongoAccounts";
import taskManager from "./Tasks/taskManager";
import { runTest } from "./Testing";
import "./initDirs";


// Small fix if the cert fails!
process.env.NODE_TLS_REJECT_UNAUTHORIZED = String( 0 );
global.PANELUPDATE = false;

const files = fs.readdirSync( LOGDIR );
files.sort( ( a, b ) => {
	const A = Number( a.replaceAll( ".log", "" ) );
	const B = Number( b.replaceAll( ".log", "" ) );
	return A < B ? 1 : -1;
} );
files.splice( 0, configManager.getDashboardConfig.LOG_MaxLogCount );
for( const logFile of files ) {
	SystemLib.logWarning( "log",
		"Remove Logfile because its over the limit:",
		BC( "Red" ),
		logFile
	);
	fs.rmSync( path.join( LOGDIR, logFile ) );
}

// create SocketIO server, Express Server and install all routings
createHttpServer();

mongoose
	.connect(
		`mongodb://${ process.env.MONGODB_HOST }:${ process.env.MONGODB_PORT }`,
		{
			user: process.env.MONGODB_USER,
			pass: process.env.MONGODB_PASSWD
		}
	)
	.then( async() => {
		SystemLib.log( "socketio", "Install socket listener" );

		await import( "@server/socketIO" );

		if( configManager.getDashboardConfig.PANEL_ArkServerIp.clearWs() !== "" ) {
			global.SERVERIP = configManager.getDashboardConfig.PANEL_ArkServerIp.clearWs();
		} else {
			const ipResponse = await fetch( "http://api.ipify.org" );
			global.SERVERIP = ( await ipResponse.text() ).clearWs();
			SystemLib.log( "ip", "Public IP: " + global.SERVERIP );
		}

		await import( "@server/trpc/server" );

		Api.use( "*", ( req: Request, res: Response ) => res.sendFile( path.join( BASEDIR, "build/index.html" ) ) );

		await sshManager.init();
		// create an account key if no there and no user
		if(
			( await MongoAccounts.count() ) <= 0 &&
			( await MongoAccountKey.count() ) <= 0
		) {
			await AccountKey.create( {
				key: "KAdmin-ArkLIN2",
				asSuperAdmin: true
			} );
			SystemLib.log(
				"DB", "Create default AccountKey:" + SystemLib.toBashColor( "Red" ),
				"KAdmin-ArkLIN2"
			);
		}


		// start Tasks
		await taskManager.init();
		SystemLib.log(
			"TASKS", `All Jobs init (Total: ${ Object.keys( taskManager.Jobs ).length })`
		);

		installErrorHandler();
		SystemLib.log( "DB", "Connected... Start API and SOCKETIO" );
		HTTPSERVER.listen( process.env.API_EXPRESS_HTTP_PORT, () =>
			SystemLib.log(
				"API/SOCKETIO", "API listen on port",
				process.env.API_EXPRESS_HTTP_PORT
			)
		);
		await runTest();
	} );
