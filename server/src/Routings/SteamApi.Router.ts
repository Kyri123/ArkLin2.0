import type * as core                      from "express-serve-static-core";
import type {
	Request,
	Response
}                                          from "express-serve-static-core";
import { CreateUrl }                       from "@server/Lib/PathBuilder.Lib";
import type { TResponse_SteamApi_Getmods } from "@app/Types/API_Response";
import { ESteamApiUrl }                    from "../../../src/Shared/Enum/Routing";
import DB_SteamAPI_Mods                    from "../MongoDB/DB_SteamAPI_Mods";
import type { TRequest_SteamApi_Getmods }  from "@app/Types/API_Request";
import { DefaultResponseSuccess }          from "../../../src/Shared/Default/ApiRequest.Default";

export default function( Api : core.Express ) {
	const Url = CreateUrl( ESteamApiUrl.getmods );
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_SteamApi_Getmods = {
			...DefaultResponseSuccess,
			Data: {}
		};

		const Request : TRequest_SteamApi_Getmods<true> = request.body;

		if ( Request.modsIds && Request.UserClass.IsLoggedIn() ) {
			for await ( const Mod of DB_SteamAPI_Mods.find( {
				publishedfileid: Request.modsIds
			} ) ) {
				if ( Response.Data && Mod.publishedfileid ) {
					Response.Data[ Mod.publishedfileid ] = Mod;
				}
			}
		}

		response.json( Response );
	} );
}
