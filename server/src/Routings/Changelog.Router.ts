import type * as core             from "express-serve-static-core";
import type {
	Request,
	Response
}                                 from "express-serve-static-core";
import { CreateUrl }              from "@server/Lib/PathBuilder.Lib";
import type {
	TResponse_Changelog_GetBranches,
	TResponse_Changelog_GetChangelogs
}                                 from "../../../src/Shared/Type/API_Response";
import { EChangelogUrl }          from "../../../src/Shared/Enum/Routing";
import DB_GithubBranches          from "../MongoDB/DB_GithubBranches";
import DB_GithubReleases          from "../MongoDB/DB_GithubReleases";
import { DefaultResponseSuccess } from "../../../src/Shared/Default/ApiRequest.Default";
import type {
	TRequest_Changelog_GetBranches,
	TRequest_Changelog_GetChangelogs
}                                 from "../../../src/Shared/Type/API_Request";
import type { UserLib }           from "@server/Lib/User.Lib";

export default function( Api : core.Express ) {
	let Url = CreateUrl( EChangelogUrl.get );
	SystemLib.Log(
		"Install Router",
		SystemLib.ToBashColor( "Red" ),
		Url,
		SystemLib.ToBashColor( "Default" ),
		"| Mode:",
		SystemLib.ToBashColor( "Red" ),
		"POST"
	);
	Api.get( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Changelog_GetChangelogs = {
			...DefaultResponseSuccess,
			Data: []
		};

		const Request : TRequest_Changelog_GetChangelogs<true, UserLib<true>> = request.body;
		if ( Request.UserClass.IsValid() ) {
			Response.Data = await DB_GithubReleases.find();
		}

		response.json( Response );
	} );

	Url = CreateUrl( EChangelogUrl.branches );
	SystemLib.Log(
		"Install Router",
		SystemLib.ToBashColor( "Red" ),
		Url,
		SystemLib.ToBashColor( "Default" ),
		"| Mode:",
		SystemLib.ToBashColor( "Red" ),
		"POST"
	);
	Api.get( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Changelog_GetBranches = {
			...DefaultResponseSuccess,
			Data: []
		};

		const Request : TRequest_Changelog_GetBranches<true, UserLib<true>> = request.body;
		if ( Request.UserClass.IsValid() ) {
			Response.Data = await DB_GithubBranches.find();
		}

		response.json( Response );
	} );
}
