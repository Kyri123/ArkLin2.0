import * as core                     from "express-serve-static-core";
import {
	Request,
	Response
}                                    from "express-serve-static-core";
import { CreateUrl }                 from "../Lib/PathBuilder.Lib";
import { TResponse_System_Getusage } from "../../../src/Shared/Type/API_Response";
import DB_Usage                      from "../MongoDB/DB_Usage";
import { ESysUrl }                   from "../../../src/Shared/Enum/Routing";
import { DefaultResponseSuccess }    from "../Defaults/ApiRequest.Default";
import { DefaultSystemUsage }        from "../../../src/Shared/Default/Server.Default";
import { TRequest_System_Getusage }  from "../../../src/Shared/Type/API_Request";

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

		const Request : TRequest_System_Getusage = request.body;
		if ( Request.UserClass.IsValid() ) {
			const Data = await DB_Usage.findOne();
			if ( Data ) {
				Response.Data = Data.toJSON();
			}
		}

		response.json( Response );
	} );
}
