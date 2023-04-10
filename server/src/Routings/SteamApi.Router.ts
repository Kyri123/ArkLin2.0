import * as core                      from "express-serve-static-core";
import {
	Request,
	Response
}                                     from "express-serve-static-core";
import { CreateUrl }                  from "../Lib/PathBuilder.Lib";
import { TResponse_SteamApi_Getmods } from "../../../src/Shared/Type/API_Response";
import { ESteamApiUrl }               from "../../../src/Shared/Enum/Routing";
import DB_SteamAPI_Mods               from "../MongoDB/DB_SteamAPI_Mods";
import { TRequest_SteamApi_Getmods }  from "../../../src/Shared/Type/API_Request";
import { DefaultResponseSuccess }     from "../../../src/Shared/Default/ApiRequest.Default";
import { UserLib }                    from "../Lib/User.Lib";

export default function( Api : core.Express ) {
	const Url = CreateUrl( ESteamApiUrl.getmods );
	SystemLib.Log(
		"Install Router",
		SystemLib.ToBashColor( "Red" ),
		Url,
		SystemLib.ToBashColor( "Default" ),
		"| Mode:",
		SystemLib.ToBashColor( "Red" ),
		"GET"
	);
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_SteamApi_Getmods = {
			...DefaultResponseSuccess,
			Data: {}
		};

		const Request : TRequest_SteamApi_Getmods<true, UserLib<true>> = request.body;

		if ( Request.modsIds && Request.UserClass.IsValid() ) {
			for await ( const Mod of DB_SteamAPI_Mods.find( {
				publishedfileid: Request.modsIds
			} ) ) {
				if ( Response.Data ) {
					Response.Data[ Mod.publishedfileid ] = Mod;
				}
			}
		}

		response.json( Response );
	} );
}
