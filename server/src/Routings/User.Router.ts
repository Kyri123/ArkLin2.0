import type * as core       from "express-serve-static-core";
import type {
	Request,
	Response
}                           from "express-serve-static-core";
import { CreateUrl }        from "@server/Lib/PathBuilder.Lib";
import type {
	TResponse_User_Addkey,
	TResponse_User_Allkeys,
	TResponse_User_Alluser,
	TResponse_User_Edituser,
	TResponse_User_Getallowedservers,
	TResponse_User_Removeaccount,
	TResponse_User_Removekey,
	TResponse_User_Usereditaccount
}                           from "@app/Types/API_Response";
import { EPerm }            from "@shared/Enum/User.Enum";
import { Md5 }              from "ts-md5";
import type { UserAccount } from "../MongoDB/DB_Accounts";
import DB_Accounts          from "../MongoDB/DB_Accounts";
import DB_AccountKey        from "../MongoDB/DB_AccountKey";
import { EUserUrl }         from "@shared/Enum/Routing";
import type {
	TRequest_User_Addkey,
	TRequest_User_Allkeys,
	TRequest_User_Alluser,
	TRequest_User_Edituser,
	TRequest_User_Getallowedservers,
	TRequest_User_Removeaccount,
	TRequest_User_Removekey,
	TRequest_User_Usereditaccount
}                           from "@app/Types/API_Request";
import {
	DefaultResponseFailed,
	DefaultResponseSuccess
}                           from "@shared/Default/ApiRequest.Default";
import { MakeRandomString } from "@kyri123/k-javascript-utils";
import DB_Instances         from "@server/MongoDB/DB_Instances";

export default function( Api : core.Express ) {
	let Url = CreateUrl( EUserUrl.alluser );
	Api.get( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_User_Alluser = {
			...DefaultResponseSuccess
		};

		const Request : TRequest_User_Alluser<true> = request.body;
		if ( Request.UserClass.HasPermission( EPerm.Super ) ) {
			Response.Data = [];
			for await ( const Account of DB_Accounts.find() ) {
				const Part : Partial<UserAccount> = Account;
				delete Part.password;
				Response.Data.push( Part );
			}
		}

		response.json( Response );
	} );

	Url = CreateUrl( EUserUrl.allkeys );
	Api.get( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_User_Allkeys = {
			...DefaultResponseSuccess
		};

		const Request : TRequest_User_Allkeys<true> = request.body;
		if ( Request.UserClass.HasPermission( EPerm.Super ) ) {
			Response.Data = [];
			for await ( const AccountKey of DB_AccountKey.find() ) {
				Response.Data.push( AccountKey );
			}
		}

		response.json( Response );
	} );

	Url = CreateUrl( EUserUrl.getallowedservers );
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_User_Getallowedservers = {
			...DefaultResponseSuccess,
			Data: {}
		};

		const Request : TRequest_User_Getallowedservers<true> = request.body;
		if ( Request.UserClass.HasPermission( EPerm.Super ) && Request.Id ) {
			const usr = await DB_Accounts.findById( Request.Id );
			for await ( const instance of DB_Instances.find( { servers: usr.servers } ) ) {
				Response.Data[ instance._id.toString() ] = instance;
			}
		}

		response.json( Response );
	} );

	Url = CreateUrl( EUserUrl.removeaccount );
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_User_Removeaccount = {
			...DefaultResponseFailed
		};

		const Request : TRequest_User_Removeaccount<true> = request.body;
		if (
			Request.UserClass.HasPermission( EPerm.Super ) &&
			Request.Id
		) {
			await DB_Accounts.deleteMany( { _id: Request.Id } );

			Response.Success = true;
			Response.Message = {
				AlertType: "success",
				Message: "Account und alle Sessions wurden erfolgreich entfernt.",
				Title: "Erfolgreich!"
			};
		}

		response.json( Response );
	} );

	Url = CreateUrl( EUserUrl.addkey );
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_User_Addkey = {
			...DefaultResponseFailed
		};

		const Request : TRequest_User_Addkey<true> = request.body;
		if (
			Request.UserClass.HasPermission( EPerm.Super ) &&
			Request.rang !== undefined
		) {
			const Key = MakeRandomString( 20, "-" );
			await DB_AccountKey.create( {
				asSuperAdmin: Request.rang !== 0,
				key: Key
			} );
			Response.Success = true;
			Response.Message = {
				AlertType: "success",
				Message: `Account Key ${ Key } wurde erstellt.`,
				Title: "Erfolgreich!"
			};
		}

		response.json( Response );
	} );

	Url = CreateUrl( EUserUrl.removekey );
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_User_Removekey = {
			...DefaultResponseFailed
		};

		const Request : TRequest_User_Removekey<true> = request.body;
		if (
			Request.UserClass.HasPermission( EPerm.Super ) &&
			Request.Id !== undefined
		) {
			await DB_AccountKey.deleteOne( { _id: Request.Id } );
			Response.Success = true;
			Response.Message = {
				AlertType: "success",
				Message: `Account Key wurde erstellt.`,
				Title: "Erfolgreich!"
			};
		}

		response.json( Response );
	} );

	Url = CreateUrl( EUserUrl.usereditaccount );
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_User_Usereditaccount = {
			...DefaultResponseFailed
		};

		const Request : TRequest_User_Usereditaccount<true> = request.body;

		if (

			Request.UserClass.HasPermission( EPerm.Super ) &&
			Request.UserData
		) {
			const LoginData = {
				...Request.UserClass.Get,
				...Request.UserData,
				_id: Request.UserClass.Get._id
			};
			if ( Request.Passwd && Request.Passwd.length >= 2 ) {
				const [ PW1, PW2 ] = Request.Passwd;
				if ( PW1 === PW2 && PW1.length >= 6 ) {
					LoginData.password = Md5.hashStr( PW1 );
				}
			}

			if (
				LoginData.username.length >= 6 &&
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test( LoginData.mail )
			) {
				DB_Accounts.findByIdAndUpdate( LoginData._id, LoginData );

				Response.Success = true;
				Response.Message = {
					AlertType: "success",
					Message:
						"Account Daten wurde bearbeitet. Du wirst die nächsten sekunden ausgeloggt!",
					Title: "Erfolgreich!"
				};
			}
		}

		response.json( Response );
	} );

	Url = CreateUrl( EUserUrl.edituser );
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_User_Edituser = {
			...DefaultResponseFailed
		};

		const Request : TRequest_User_Edituser<true> = request.body;

		if (
			Request.UserClass.HasPermission( EPerm.Super ) &&
			Request.UserID &&
			Request.User
		) {
			await DB_Accounts.findByIdAndUpdate( Request.UserID, Request.User );
			Response.Success = true;
			Response.Message = {
				AlertType: "success",
				Message: "Account Daten wurde bearbeitet.",
				Title: "Erfolgreich!"
			};
		}

		response.json( Response );
	} );
}
