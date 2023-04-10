import * as core         from "express-serve-static-core";
import {
	Request,
	Response
}                        from "express-serve-static-core";
import { CreateUrl }     from "../Lib/PathBuilder.Lib";
import {
	TResponse_Auth_SignIn,
	TResponse_Auth_SignUp
}                        from "../../../src/Shared/Type/API_Response";
import { Md5 }           from "ts-md5";
import { ConfigManager } from "../Lib/ConfigManager.Lib";
import {
	GenerateAccessToken,
	GetSecretAppToken,
	UserLib
}                        from "../Lib/User.Lib";
import DB_Accounts       from "../MongoDB/DB_Accounts";
import DB_AccountKey     from "../MongoDB/DB_AccountKey";
import { IMO_Accounts }  from "../../../src/Types/MongoDB";
import * as jwt          from "jsonwebtoken";
import { EAuthUrl }      from "../../../src/Shared/Enum/Routing";
import {
	TRequest_Auth_SignIn,
	TRequest_Auth_SignUp
}                        from "../../../src/Shared/Type/API_Request";
import {
	DefaultResponseFailed,
	DefaultResponseSuccess
}                        from "../../../src/Shared/Default/ApiRequest.Default";

export default function( Api : core.Express ) {
	let Url = CreateUrl( EAuthUrl.check );
	SystemLib.Log(
		"Install Router",
		SystemLib.ToBashColor( "Red" ),
		Url,
		SystemLib.ToBashColor( "Default" ),
		"| Mode:",
		SystemLib.ToBashColor( "Red" ),
		"POST"
	);
	Api.post( Url, async( request : Request, response : Response ) => {
		const AuthHeader = request.headers[ "authorization" ];
		const Token = AuthHeader && AuthHeader.split( " " )[ 1 ].replaceAll( "\"", "" );

		if ( Token == null ) {
			response.json( {
				...DefaultResponseFailed,
				Success: true
			} );
			return;
		}

		jwt.verify( Token, GetSecretAppToken(), async( err, user : any ) => {
			if ( err ) {
				response.json( {
					...DefaultResponseFailed,
					Success: true
				} );
				return;
			}

			const User : IMO_Accounts & jwt.JwtPayload = user;
			if ( ( User.exp || 0 ) >= Date.now() / 1000 ) {
				try {
					let UserDB = await DB_Accounts.findById( User._id );
					if ( UserDB ) {
						if ( !UserDB.permissions ) {
							UserDB = ( await DB_Accounts.findByIdAndUpdate( User._id, {
								permissions: []
							} ) )!;
						}

						if ( User.permissions !== UserDB.permissions && User.exp ) {
							const NewToken = GenerateAccessToken(
								UserDB.toJSON(),
								( User.exp - Math.trunc( Date.now() / 1000 ) ) / 24 / 60 / 60
							);
							response.json( {
								...DefaultResponseSuccess,
								Data: { JsonWebToken: NewToken },
								Auth: true
							} );
							return;
						}

						response.json( {
							...DefaultResponseSuccess,
							Auth: true
						} );
						return;
					}
				}
				catch ( e ) {
				}
			}

			response.json( {
				Auth: false,
				Success: true
			} );
		} );
	} );

	Url = CreateUrl( EAuthUrl.signup );
	SystemLib.Log(
		"Install Router",
		SystemLib.ToBashColor( "Red" ),
		Url,
		SystemLib.ToBashColor( "Default" ),
		"| Mode:",
		SystemLib.ToBashColor( "Red" ),
		"POST"
	);
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Auth_SignUp = {
			...DefaultResponseFailed,
			Message: {
				AlertType: "danger",
				Message:
					"Account konnte nicht erstellt werden da die daten nicht richtig sind.",
				Title: "Account wurde nicht erstellt!"
			},
			Data: {
				JsonWebToken: ""
			}
		};
		const Request : TRequest_Auth_SignUp<true, UserLib<true>> = request.body;

		if (
			Request.password &&
			Request.email &&
			Request.user &&
			Request.passwordagain &&
			Request.accountkey
		) {
			const State : boolean[] = [
				Request.user.length < 6,
				!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test( Request.email ),
				Request.password.length < 7,
				Request.passwordagain !== Request.password ||
				Request.passwordagain.length < 7,
				Request.accountkey.length < 10
			];

			if ( !State.find( ( e ) => e === true ) ) {
				const Key = await DB_AccountKey.findOne( {
					key: Request.accountkey
				} );

				if ( Key !== null ) {
					const AccountCheck = await DB_Accounts.findOne( {
						$or: [ { username: Request.user }, { mail: Request.email } ]
					} );

					if ( AccountCheck === null ) {
						const NewAccount = await DB_Accounts.create( {
							mail: Request.email.replaceAll( " ", "" ),
							password: Md5.hashStr( Request.password.replaceAll( " ", "" ) ),
							permissions: Key.AsSuperAdmin ? [ "Super" ] : [],
							servers: [],
							username: Request.user.replaceAll( " ", "" )
						} );

						if ( NewAccount !== null ) {
							await DB_AccountKey.deleteMany( { key: Request.accountkey } );

							Response.Success = true;
							Response.Message.Message = "Account wurde erstellt du wirst nun eingeloggt.";
							Response.Message.AlertType = "success";
							Response.Message.Title = "Account erstellt!";
							Response.Auth = true;
							Response.Data = {
								JsonWebToken: GenerateAccessToken( NewAccount.toJSON() )
							};
						}
					}
					else {
						Response.Message.Message = "Account Existiert bereits!";
					}
				}
				else {
					Response.Message.Message = "Account Schlüssel ist nicht verfügbar!";
				}
			}
		}

		response.json( Response );
	} );

	Url = CreateUrl( EAuthUrl.signin );
	SystemLib.Log(
		"Install Router",
		SystemLib.ToBashColor( "Red" ),
		Url,
		SystemLib.ToBashColor( "Default" ),
		"| Mode:",
		SystemLib.ToBashColor( "Red" ),
		"POST"
	);
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Auth_SignIn = {
			...DefaultResponseFailed,
			Message: {
				AlertType: "danger",
				Message: "Account wurde nicht gefunden.",
				Title: "Fehler!"
			},
			Data: {
				JsonWebToken: ""
			}
		};
		const Request : TRequest_Auth_SignIn<true, UserLib<true>> = request.body;

		if (
			Request.login &&
			Request.password &&
			Request.stayloggedin !== undefined
		) {
			Request.password = Md5.hashStr( Request.password );
			const UserCheck = await DB_Accounts.findOne( {
				$or: [ { username: Request.login }, { mail: Request.login } ],
				password: Request.password
			} );

			if ( UserCheck !== null ) {
				Response.Message.Message = "Erfolgreich eingeloggt!";
				Response.Message.AlertType = "success";
				Response.Message.Title = "Account erstellt!";
				Response.Success = true;
				Response.Auth = true;
				Response.Data = {
					JsonWebToken: GenerateAccessToken(
						UserCheck.toJSON(),
						Request.stayloggedin
							? ConfigManager.GetApiConfig.AccountHashExpire
							: 1
					)
				};
			}
		}

		response.json( Response );
	} );
}
