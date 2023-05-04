import type * as core                     from "express-serve-static-core";
import type {
	Request,
	Response
}                                         from "express-serve-static-core";
import { CreateUrl }                      from "@server/Lib/PathBuilder.Lib";
import type { TResponse_System_Getusage } from "../../../src/Shared/Type/API_Response";
import DB_Usage                           from "../MongoDB/DB_Usage";
import { ESysUrl }                        from "../../../src/Shared/Enum/Routing";
import { DefaultResponseSuccess }         from "../../../src/Shared/Default/ApiRequest.Default";
import { DefaultSystemUsage }             from "../../../src/Shared/Default/Server.Default";
import type { TRequest_System_Getusage }  from "../../../src/Shared/Type/API_Request";
import type { UserLib }                   from "@server/Lib/User.Lib";

export default function( Api : core.Express ) {
	const Url = CreateUrl( ESysUrl.usage );
	SystemLib.Log(
		"Install Router",
		SystemLib.ToBashColor( "Red" ),
		Url,
		SystemLib.ToBashColor( "Default" ),
		"| Mode:",
		SystemLib.ToBashColor( "Red" ),
		"GET"
	);
	Api.get( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_System_Getusage = {
			...DefaultResponseSuccess,
			Data: {
				...DefaultSystemUsage()
			}
		};

		const Request : TRequest_System_Getusage<true, UserLib<true>> = request.body;
		if ( Request.UserClass.IsValid() ) {
			const Data = await DB_Usage.findOne();
			if ( Data ) {
				Response.Data = Data.toJSON();
			}
		}

		response.json( Response );
	} );
}
