import * as core            from "express-serve-static-core";
import {
	Request,
	Response
}                           from "express-serve-static-core";
import {
	CreateUrl,
	MakeRandomID
}                           from "../Lib/PathBuilder.Lib";
import { IRequestBody }     from "../Types/Express";
import { IAPIResponseBase } from "../../../src/Types/API";
import { EPerm }            from "../../../src/Shared/Enum/User.Enum";
import { UserLib }          from "../Lib/User.Lib";
import { IInstanceData }    from "../../../src/Shared/Type/ArkSE";
import { Md5 }              from "ts-md5";
import {
	IMO_Accounts,
	IMO_Instance
}                           from "../../../src/Shared/Api/MongoDB";
import DB_Accounts          from "../MongoDB/DB_Accounts";
import DB_AccountKey        from "../MongoDB/DB_AccountKey";
import { EUserUrl }         from "../../../src/Shared/Enum/Routing";

export default function( Api : core.Express ) {
	let Url = CreateUrl( EUserUrl.alluser );
	SystemLib.Log( "Install Router", SystemLib.ToBashColor( "Red" ), Url, SystemLib.ToBashColor( "Default" ), "| Mode:", SystemLib.ToBashColor( "Red" ), "GET" )
	Api.get( Url, ( async( request : Request, response : Response ) => {
		const Response : IAPIResponseBase = {
			Auth: false,
			Success: true,
		}

		const Request : IRequestBody = request.body;
		if ( Request.UserClass.HasPermission( EPerm.Super ) ) {
			Response.Data = [];
			for await ( const Account of DB_Accounts.find() ) {
				const Part : Partial<IMO_Accounts> = Account;
				delete Part.password;
				Response.Data.push( Part );
			}
		}

		response.json( Response );
	} ) );


	Url = CreateUrl( EUserUrl.allkeys );
	SystemLib.Log( "Install Router", SystemLib.ToBashColor( "Red" ), Url, SystemLib.ToBashColor( "Default" ), "| Mode:", SystemLib.ToBashColor( "Red" ), "GET" )
	Api.get( Url, ( async( request : Request, response : Response ) => {
		const Response : IAPIResponseBase = {
			Auth: false,
			Success: true,
		}

		const Request : IRequestBody = request.body;
		if ( Request.UserClass.HasPermission( EPerm.Super ) ) {
			Response.Data = [];
			for await ( const AccountKey of DB_AccountKey.find() ) {
				Response.Data.push( AccountKey );
			}
		}

		response.json( Response );
	} ) );


	Url = CreateUrl( EUserUrl.getallowedservers );
	SystemLib.Log( "Install Router", SystemLib.ToBashColor( "Red" ), Url, SystemLib.ToBashColor( "Default" ), "| Mode:", SystemLib.ToBashColor( "Red" ), "POST" )
	Api.post( Url, ( async( request : Request, response : Response ) => {
		const Response : IAPIResponseBase<Record<string, IMO_Instance>> = {
			Auth: false,
			Success: true,
			Data: {}
		}

		const Request : IRequestBody<{
			Id? : string
		}> = request.body;
		if ( Request.UserClass.HasPermission( EPerm.Super ) && Request.Id ) {
			const User = new UserLib( Request.Id );
			await User.Read();
			Response.Data = await User.GetAllServerWithPermission();
		}

		response.json( Response );
	} ) );


	Url = CreateUrl( EUserUrl.removeaccount );
	SystemLib.Log( "Install Router", SystemLib.ToBashColor( "Red" ), Url, SystemLib.ToBashColor( "Default" ), "| Mode:", SystemLib.ToBashColor( "Red" ), "POST" )
	Api.post( Url, ( async( request : Request, response : Response ) => {
		const Response : IAPIResponseBase<Record<string, IInstanceData>> = {
			Auth: false,
			Success: false,
			Data: {}
		}

		const Request : IRequestBody<{
			Id? : number
		}> = request.body;
		if ( Request.UserClass.HasPermission( EPerm.Super ) && Request.Id !== undefined ) {
			await DB_Accounts.deleteMany( { _id: Request.Id } );

			Response.Success = true;
			Response.Message = {
				AlertType: "success",
				Message: "Account und alle Sessions wurden erfolgreich entfernt.",
				Title: "Erfolgreich!"
			}
		}

		response.json( Response );
	} ) );


	Url = CreateUrl( EUserUrl.addkey );
	SystemLib.Log( "Install Router", SystemLib.ToBashColor( "Red" ), Url, SystemLib.ToBashColor( "Default" ), "| Mode:", SystemLib.ToBashColor( "Red" ), "POST" )
	Api.post( Url, ( async( request : Request, response : Response ) => {
		const Response : IAPIResponseBase<Record<string, IInstanceData>> = {
			Auth: false,
			Success: false,
			Data: {}
		}

		const Request : IRequestBody<{
			rang? : number
		}> = request.body;
		if ( Request.UserClass.HasPermission( EPerm.Super ) && Request.rang !== undefined ) {
			const Key = MakeRandomID( 20, true );
			await DB_AccountKey.create( {
				AsSuperAdmin: Request.rang !== 0,
				key: Key
			} )
			Response.Success = true;
			Response.Message = {
				AlertType: "success",
				Message: `Account Key ${ Key } wurde erstellt.`,
				Title: "Erfolgreich!"
			}
		}

		response.json( Response );
	} ) );


	Url = CreateUrl( EUserUrl.removekey );
	SystemLib.Log( "Install Router", SystemLib.ToBashColor( "Red" ), Url, SystemLib.ToBashColor( "Default" ), "| Mode:", SystemLib.ToBashColor( "Red" ), "POST" )
	Api.post( Url, ( async( request : Request, response : Response ) => {
		const Response : IAPIResponseBase<Record<string, IInstanceData>> = {
			Auth: false,
			Success: false,
			Data: {}
		}

		const Request : IRequestBody<{
			Id? : string
		}> = request.body;
		if ( Request.UserClass.HasPermission( EPerm.Super ) && Request.Id !== undefined ) {
			await DB_AccountKey.deleteOne( { _id: Request.Id } );
			Response.Success = true;
			Response.Message = {
				AlertType: "success",
				Message: `Account Key wurde erstellt.`,
				Title: "Erfolgreich!"
			}
		}

		response.json( Response );
	} ) );


	Url = CreateUrl( EUserUrl.usereditaccount );
	SystemLib.Log( "Install Router", SystemLib.ToBashColor( "Red" ), Url, SystemLib.ToBashColor( "Default" ), "| Mode:", SystemLib.ToBashColor( "Red" ), "POST" )
	Api.post( Url, ( async( request : Request, response : Response ) => {
		const Response : IAPIResponseBase = {
			Auth: false,
			Success: false,
			Message: {
				AlertType: "danger",
				Message: `Fehler beim verarbeiten der Daten.`,
				Title: "Fehler!"
			}
		}

		const Request : IRequestBody<{
			UserData? : IMO_Accounts,
			Passwd? : string[]
		}> = request.body;

		if ( Request.UserClass.HasPermission( EPerm.Super ) && Request.UserData !== undefined ) {
			const LoginData = {
				...Request.UserClass.GetDB(),
				...Request.UserData,
				_id: Request.UserClass.GetDB()._id
			};
			if ( Request.Passwd && Request.Passwd.length >= 2 ) {
				const [ PW1, PW2 ] = Request.Passwd;
				if ( PW1 === PW2 && PW1.length >= 6 ) {
					LoginData.password = Md5.hashStr( PW1 );
				}
			}

			if ( LoginData.username.length >= 6 && /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test( LoginData.mail ) ) {
				DB_Accounts.findByIdAndUpdate( LoginData._id, LoginData );

				Response.Success = true;
				Response.Message = {
					AlertType: "success",
					Message: "Account Daten wurde bearbeitet. Du wirst die nächsten sekunden ausgeloggt!",
					Title: "Erfolgreich!"
				}
			}
		}

		response.json( Response );
	} ) );


	Url = CreateUrl( EUserUrl.edituser );
	SystemLib.Log( "Install Router", SystemLib.ToBashColor( "Red" ), Url, SystemLib.ToBashColor( "Default" ), "| Mode:", SystemLib.ToBashColor( "Red" ), "POST" )
	Api.post( Url, ( async( request : Request, response : Response ) => {
		const Response : IAPIResponseBase = {
			Auth: false,
			Success: false,
			Message: {
				AlertType: "danger",
				Message: `Fehler beim verarbeiten der Daten.`,
				Title: "Fehler!"
			}
		}

		const Request : IRequestBody<{
			UserID : string,
			User : Partial<IMO_Accounts>
		}> = request.body;

		if ( Request.UserClass.HasPermission( EPerm.Super ) && Request.UserID && Request.User ) {
			await DB_Accounts.findByIdAndUpdate( Request.UserID, Request.User );
			Response.Success = true;
			Response.Message = {
				AlertType: "success",
				Message: "Account Daten wurde bearbeitet.",
				Title: "Erfolgreich!"
			}
		}

		response.json( Response );
	} ) );
}