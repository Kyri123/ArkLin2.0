import "./InitDirs";
import { InstallRoutings } from "./Init";
import * as path           from "path";
import "./Lib/System.Lib";
import "./TypeExtension/TE_InstallAll";

import express              from "express";
import * as http            from "http";
import {
	Server,
	Socket
}                           from "socket.io";
import {
	IEmitEvents,
	IListenEvents
}                           from "../../src/Shared/Type/Socket";
import * as process         from "process";
import fs                   from "fs";
import {
	ConfigManager,
	SSHManager
}                           from "./Lib/ConfigManager.Lib";
import {
	GetSecretAppToken,
	UserLib
}                           from "./Lib/User.Lib";
import * as mongoose        from "mongoose";
import AccountKey           from "./MongoDB/DB_AccountKey";
import DB_AccountKey        from "./MongoDB/DB_AccountKey";
import DB_Accounts          from "./MongoDB/DB_Accounts";
import TaskManager          from "./Tasks/TaskManager";
import * as jwt             from "jsonwebtoken";
import { CreateUrl }        from "./Lib/PathBuilder.Lib";
import { RunTest }          from "./Testing";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import fetch                from "node-fetch";

// Small fix if the cert fails!
process.env.NODE_TLS_REJECT_UNAUTHORIZED = String( 0 );
global.__PANNELUPDATE = false;

fetch( "http://api.ipify.org" ).then( async( r ) => {
	global.__PublicIP = await r.text();
} );

const Files = fs.readdirSync( __LogDir );
Files.sort( ( a, b ) => {
	const A = Number( a.replaceAll( ".log", "" ) );
	const B = Number( b.replaceAll( ".log", "" ) );
	return A < B ? 1 : -1;
} );
Files.splice( 0, ConfigManager.GetDashboardConifg.LOG_MaxLogCount );
for ( const LogFile of Files ) {
	SystemLib.LogWarning(
		"Remove Logfile because its over the limit:",
		SystemLib.ToBashColor( "Red" ),
		LogFile
	);
	fs.rmSync( path.join( __LogDir, LogFile ) );
}

global.Api = express();
global.HttpServer = http.createServer( Api );
global.SocketIO = new Server<IListenEvents, IEmitEvents>( HttpServer, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
} );

// Api should use JsonOnly!
Api.use( express.json() );
Api.use( express.static( path.join( __basedir, "build" ) ) );

const Connection = async(
	socket : Socket<IListenEvents, IEmitEvents, DefaultEventsMap, any>
) => {
	socket.emit( "Connect" );
};

SocketIO.on( "connection", Connection );

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

Api.all( "*", async function( req, res, next ) {
	// Todo: Remove or uncomment
	if ( SystemLib.DebugMode() ) {
		//console.log( "POST:", req.path )
	}

	req.body = {
		...req.body,
		...req.query
	};

	if ( !req.path.includes( CreateUrl( "" ) ) ) {
		res.sendFile( path.join( __dirname, "../..", "build", "index.html" ) );
		return;
	}

	if ( req.path.includes( "/auth/" ) ) {
		next();
		return;
	}

	const AuthHeader = req.headers[ "authorization" ];
	const Token = AuthHeader && AuthHeader.split( " " )[ 1 ].replaceAll( "\"", "" );

	if ( Token == null ) {
		return;
	}

	jwt.verify( Token, GetSecretAppToken(), async( err, user : any ) => {
		if ( err ) {
			res.json( {
				Auth: false,
				Success: true
			} );
			return;
		}

		req.body.UserClass = await UserLib.build( user );

		if ( req.body.UserClass.IsValid() ) {
			next();
			return;
		}

		res.json( {
			Auth: false,
			Success: false,
			Message: {
				AlertType: "danger",
				Message: `Fehler beim verarbeiten der Daten.`,
				Title: "Fehler!"
			}
		} );
	} );
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
		await SSHManager.Init();
		// create an account key if no there and no user
		if (
			( await DB_Accounts.count() ) <= 0 &&
			( await DB_AccountKey.count() ) <= 0
		) {
			await AccountKey.create( {
				key: "KAdmin-ArkLIN2",
				AsSuperAdmin: true
			} );
			SystemLib.Log(
				"[DB] Create default AccountKey:" + SystemLib.ToBashColor( "Red" ),
				"KAdmin-ArkLIN2"
			);
		}

		// start Tasks
		await TaskManager.Init();
		SystemLib.Log(
			`[TASKS] All Jobs init (Total: ${ Object.keys( TaskManager.Jobs ).length })`
		);

		SystemLib.Log( "[DB] Connected... Start API and SOCKETIO" );
		HttpServer.listen( process.env.API_EXPRESS_HTTP_PORT, () =>
			SystemLib.Log(
				"[API/SOCKETIO] API listen on port",
				process.env.API_EXPRESS_HTTP_PORT
			)
		);
		await RunTest();
	} );
