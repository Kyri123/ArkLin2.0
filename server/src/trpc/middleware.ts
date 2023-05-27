import { installRoutings } from "@/server/src/init";
import { errorResponse } from "@/server/src/Lib/openApi.response";
import { getSecretAppToken } from "@/server/src/Lib/user.Lib";
import type { EmitEvents, ListenEvents } from "@/src/Types/Socket";
import User from "@app/Lib/User.Lib";
import MongoAccounts from "@server/MongoDB/MongoAccounts";
import MongoSessionToken from "@server/MongoDB/MongoSessionToken";
import type {
	NextFunction,
	Request,
	Response
} from "express";
import express from "express";
import http from "http";
import * as jwt from "jsonwebtoken";
import path from "path";
import { Server } from "socket.io";


export class ApiError extends Error {
	public errorCode: number;

	public constructor( errorCode: number, message: string ) {
		super( message );
		this.errorCode = errorCode;
	}
}

export async function expressMiddlewareAuth( req: Request, res: Response, next: NextFunction ) {
	/*const Response : ResponseBase = {
	 ...DefaultResponseFailed,
	 MessageCode: "Api.error.Unauthorized"
	 };*/

	const authHeader = req.headers[ "authorization" ];
	let token: string | undefined = undefined;
	try {
		token = authHeader && authHeader.split( " " )[ 1 ].replaceAll( "\"", "" );
	} catch( e ) {
		if( e instanceof Error ) {
			SystemLib.debugLog( "expressMiddlewareAuth", e.message );
		}
	}

	if( token ) {
		try {
			const result = jwt.verify( token, getSecretAppToken() );
			if( typeof result === "object" ) {
				const userData = new User( token );
				if( await MongoSessionToken.exists( { token, userid: userData.get._id } ) ) {
					req.body.UserClass = userData;
					next();
					return;
				}
			}
		} catch( e ) {
			if( e instanceof Error ) {
				SystemLib.debugLog( "expressMiddlewareAuth", e.message );
			}
		}
	}
	res.sendStatus( 401 );
}

export async function expressMiddlewareRestAPI( req: Request, res: Response, next: NextFunction ) {
	const apiKey = req.get( "API-Key" );
	if( !apiKey ) {
		return next( new ApiError( 403, "Missing API Key" ) );
	}

	const user = await MongoAccounts.findOne( { apiKey } );
	if( !user ) {
		return next( new ApiError( 403, "Wrong API Key" ) );
	}
	req.body.user = user.toJSON();
	next();
}

export function createHttpServer() {
	global.Api = express();
	global.HTTPSERVER = http.createServer( Api );
	global.SocketIO = new Server<ListenEvents, EmitEvents>( HTTPSERVER, {
		cors: {
			origin: "*",
			methods: [ "GET", "POST" ]
		}
	} );

	// Api should use JsonOnly!
	Api.use( express.json() );
	Api.use( express.static( path.join( BASEDIR, "build" ) ) );

	Api.use( ( req, res, next ) => {
		res.setHeader( "Access-Control-Allow-Origin", "*" );
		res.setHeader( "Access-Control-Allow-Methods", "GET, POST" );
		res.setHeader(
			"Access-Control-Allow-Headers",
			"X-Requested-With,content-type"
		);
		res.setHeader( "Access-Control-Allow-Credentials", "true" );
		next();
	} );

	installRoutings( path.join( __dirname, "..", "Routings" ), Api );
}

export function installErrorHandler() {
	Api.use( ( err, req, res, next ) => {
		if( err instanceof Error ) {
			if( err instanceof ApiError ) {
				return res.status( err.errorCode ).json( errorResponse( err.message, res ) );
			}
			return res.status( 500 ).send( errorResponse( err.message, res ) );
		}
		res.status( 500 ).send( errorResponse( "unknown error", res ) );
	} );
}
