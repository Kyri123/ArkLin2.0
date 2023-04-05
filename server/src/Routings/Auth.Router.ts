import * as core                from "express-serve-static-core";
import {
	Request,
	Response
}                               from "express-serve-static-core";
import { CreateUrl }            from "../Lib/PathBuilder.Lib";
import {
	IAPIResponseBase,
	IAPIResponseMessage
}                               from "../../../src/Types/API";
import { Md5 }                  from "ts-md5";
import { ConfigManager }        from "../Lib/ConfigManager.Lib";
import {
	ISignInRequest,
	ISignUpRequest
}                               from "../../../src/Shared/Api/Auth.Request";
import { IAccountInformations } from "../../../src/Shared/Type/User";
import {
	GenerateAccessToken,
	GetSecretAppToken
}                               from "../Lib/User.Lib";
import DB_Accounts              from "../MongoDB/DB_Accounts";
import DB_AccountKey            from "../MongoDB/DB_AccountKey";
import { IMO_Accounts }         from "../../../src/Shared/Api/MongoDB";
import * as jwt                 from "jsonwebtoken";
import { EAuthUrl }             from "../../../src/Shared/Enum/Routing";

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
				Auth: false,
				Success: true
			} );
			return;
		}

		jwt.verify( Token, GetSecretAppToken(), async( err, user : any ) => {
			if ( err ) {
				response.json( {
					Auth: false,
					Success: true
				} );
				return;
			}

			const User : IMO_Accounts & jwt.JwtPayload = user;
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
							Data: { JsonWebToken: NewToken },
							Auth: true,
							Success: true
						} );
						return;
					}

					response.json( {
						Auth: true,
						Success: true
					} );
					return;
				}
			}
			catch ( e ) {
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
		const Failed = true;
		const Message : IAPIResponseMessage = {
			AlertType: "danger",
			Message:
				"Account konnte nicht erstellt werden da die daten nicht richtig sind.",
			Title: "Account wurde nicht erstellt!"
		};
		const Response : IAPIResponseBase<IAccountInformations> = {
			Auth: false,
			Success: true
		};
		const Request : ISignUpRequest = request.body as ISignUpRequest;

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

					console.log( AccountCheck );
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

							Message.Message =
								"Account wurde erstellt du wirst nun eingeloggt.";
							Message.AlertType = "success";
							Message.Title = "Account erstellt!";
							Response.Auth = true;
							Response.Data = {
								JsonWebToken: GenerateAccessToken( NewAccount.toJSON() )
							};
						}
					}
					else {
						Message.Message = "Account Existiert bereits!";
					}
				}
				else {
					Message.Message = "Account Schlüssel ist nicht verfügbar!";
				}
			}
		}

		if ( Failed ) {
			Response.Message = Message;
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
		const Failed = true;
		const Message : IAPIResponseMessage = {
			AlertType: "danger",
			Message: "Account wurde nicht gefunden.",
			Title: "Fehler!"
		};
		const Response : IAPIResponseBase<IAccountInformations> = {
			Auth: false,
			Success: true
		};
		const Request : ISignInRequest = request.body as ISignInRequest;

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
				Message.Message = "Erfolgreich eingeloggt!";
				Message.AlertType = "success";
				Message.Title = "Account erstellt!";
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

		if ( Failed ) {
			Response.Message = Message;
		}
		response.json( Response );
	} );
}
