import type {
	NextFunction,
	Request,
	Response
}                            from "express";
import User                  from "@app/Lib/User.Lib";
import DB_SessionToken       from "@server/MongoDB/DB_SessionToken";
import * as jwt              from "jsonwebtoken";
import DB_Accounts           from "@server/MongoDB/DB_Accounts";
import { errorResponse }     from "@server/Lib/openApi.response";
import { GetSecretAppToken } from "@server/Lib/User.Lib";

export async function MW_Auth( req : Request, res : Response, next : NextFunction ) {
	/*const Response : ResponseBase = {
	 ...DefaultResponseFailed,
	 MessageCode: "Api.error.Unauthorized"
	 };*/

	const AuthHeader = req.headers[ "authorization" ];
	let Token : string | undefined = undefined;
	try {
		Token = AuthHeader && AuthHeader.split( " " )[ 1 ].replaceAll( "\"", "" );
	}
	catch ( e ) {
	}

	if ( Token ) {
		try {
			const Result = jwt.verify( Token, GetSecretAppToken() );
			if ( typeof Result === "object" ) {
				const UserData = new User( Token );
				const Session = await DB_SessionToken.findOne( { token: Token, userid: UserData.Get._id } );
				if ( Session ) {
					req.body.UserClass = UserData;
					next();
					return;
				}
			}
		}
		catch ( e ) {
			console.log( e );
		}
	}
	res.sendStatus( 401 );
}

export async function MW_REST( req : Request, res : Response, next : NextFunction ) {
	const apiKey = req.get( "API-Key" );
	if ( !apiKey ) {
		return res.status( 403 ).json( errorResponse( "Missing API Key", res ) );
	}

	const user = await DB_Accounts.findOne( { apiKey } );
	if ( !user ) {
		return res.status( 403 ).json( errorResponse( "Wrong API Key", res ) );
	}
	req.body.user = user.toJSON();
	next();
}