import * as core            from "express-serve-static-core";
import {
	Request,
	Response
}                           from "express-serve-static-core";
import { CreateUrl }        from "../Lib/PathBuilder.Lib";
import { IAPIResponseBase } from "../../../src/Types/API";
import { ISystemUsage }     from "../../../src/Shared/Type/Systeminformation";
import DB_Usage             from "../MongoDB/DB_Usage";
import { ESysUrl }          from "../../../src/Shared/Enum/Routing";

export default function( Api : core.Express ) {
	const Url = CreateUrl( ESysUrl.usage );
	SystemLib.Log( "Install Router", SystemLib.ToBashColor( "Red" ), Url, SystemLib.ToBashColor( "Default" ), "| Mode:", SystemLib.ToBashColor( "Red" ), "GET" )
	Api.get( Url, ( async( request : Request, response : Response ) => {
		const Response : IAPIResponseBase<ISystemUsage> = {
			Auth: false,
			Success: true,
		}

		const Data = await DB_Usage.findOne();
		if ( Data ) {
			Response.Data = Data.toJSON();
		}

		response.json( Response );
	} ) );
}