import { DefaultResponseFailed } from "@shared/Default/ApiRequest.Default";
import type { ResponseBase }     from "@app/Types/API_Response";
import type {
	NextFunction,
	Request,
	Response
}                                from "express";
import User                      from "@app/Lib/User.Lib";
import DB_SessionToken           from "@server/MongoDB/DB_SessionToken";
import * as jwt                  from "jsonwebtoken";
import DB_Accounts               from "@server/MongoDB/DB_Accounts";

export async function MW_Auth( req : Request, res : Response, next : NextFunction ) {
	const Response : ResponseBase = {
		...DefaultResponseFailed,
		MessageCode: "Api.error.Unauthorized"
	};

	const AuthHeader = req.headers[ "authorization" ];
	let Token : string | undefined = undefined;
	try {
		Token = AuthHeader && AuthHeader.split( " " )[ 1 ].replaceAll( "\"", "" );
	}
	catch ( e ) {
	}

	if ( Token ) {
		try {
			const Result = jwt.verify( Token, process.env.JWTToken as string );
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
		}
	}
	res.json( Response );
}

export async function MW_REST( req : Request, res : Response, next : NextFunction ) {
	const apiKey = req.get( "API-Key" );
	if ( !await DB_Accounts.exists( { apiKey } ) ) {
		return res.status( 401 ).json( { error: "unauthorised" } );
	}
	next();
}