import * as core            from "express-serve-static-core";
import {
	Request,
	Response
}                           from "express-serve-static-core";
import { CreateUrl }        from "../Lib/PathBuilder.Lib";
import { IRequestBody }     from "../Types/Express";
import { IAPIResponseBase } from "../../../src/Types/API";
import { EChangelogUrl }    from "../../../src/Shared/Enum/Routing";
import DB_GithubBranches    from "../MongoDB/DB_GithubBranches";
import { IGithubBranche }   from "../../../src/Shared/Api/github";
import DB_GithubReleases    from "../MongoDB/DB_GithubReleases";

export default function( Api : core.Express ) {

	let Url = CreateUrl( EChangelogUrl.get );
	SystemLib.Log( "Install Router", SystemLib.ToBashColor( "Red" ), Url, SystemLib.ToBashColor( "Default" ), "| Mode:", SystemLib.ToBashColor( "Red" ), "POST" )
	Api.get( Url, ( async( request : Request, response : Response ) => {
		const Response : IAPIResponseBase<any[]> = {
			Auth: false,
			Success: true
		}

		const Request : IRequestBody = request.body;
		if ( Request.UserClass ) {
			Response.Data = await DB_GithubReleases.find();
		}

		response.json( Response );
	} ) );

	Url = CreateUrl( EChangelogUrl.branches );
	SystemLib.Log( "Install Router", SystemLib.ToBashColor( "Red" ), Url, SystemLib.ToBashColor( "Default" ), "| Mode:", SystemLib.ToBashColor( "Red" ), "POST" )
	Api.get( Url, ( async( request : Request, response : Response ) => {
		const Response : IAPIResponseBase<IGithubBranche[]> = {
			Auth: false,
			Success: true
		}

		const Request : IRequestBody = request.body;
		if ( Request.UserClass ) {
			Response.Data = await DB_GithubBranches.find();
		}

		response.json( Response );
	} ) );

}