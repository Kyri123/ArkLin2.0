import * as core            from "express-serve-static-core";
import {
	Request,
	Response
}                           from "express-serve-static-core";
import { CreateUrl }        from "../Lib/PathBuilder.Lib";
import { IRequestBody }     from "../Types/Express";
import { IAPIResponseBase } from "../../../src/Types/API";
import DB_GitlabReleases    from "../MongoDB/DB_GitlabReleases";
import { EChangelogUrl }    from "../../../src/Shared/Enum/Routing";

export default function( Api : core.Express ) {
	const Url = CreateUrl( EChangelogUrl.get );
	SystemLib.Log( "Install Router", SystemLib.ToBashColor( "Red" ), Url, SystemLib.ToBashColor( "Default" ), "| Mode:", SystemLib.ToBashColor( "Red" ), "POST" )
	Api.get( Url, ( async( request : Request, response : Response ) => {
		const Response : IAPIResponseBase = {
			Auth: false,
			Success: true
		}

		const Request : IRequestBody = request.body;
		if ( Request.UserClass ) {
			Response.Data = await DB_GitlabReleases.find();
		}

		response.json( Response );
	} ) );
}