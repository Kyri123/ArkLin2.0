import type * as core             from "express-serve-static-core";
import type {
	Request,
	Response
}                                 from "express-serve-static-core";
import { CreateUrl }              from "@server/Lib/PathBuilder.Lib";
import type {
	TResponse_Changelog_GetBranches,
	TResponse_Changelog_GetChangelogs
}                                 from "@app/Types/API_Response";
import { EChangelogUrl }          from "@shared/Enum/Routing";
import DB_GithubBranches          from "../MongoDB/DB_GithubBranches";
import DB_GithubReleases          from "../MongoDB/DB_GithubReleases";
import { DefaultResponseSuccess } from "@shared/Default/ApiRequest.Default";
import type {
	TRequest_Changelog_GetBranches,
	TRequest_Changelog_GetChangelogs
}                                 from "@app/Types/API_Request";

export default function( Api : core.Express ) {
	let Url = CreateUrl( EChangelogUrl.get );
	Api.get( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Changelog_GetChangelogs = {
			...DefaultResponseSuccess,
			Data: []
		};

		const Request : TRequest_Changelog_GetChangelogs<true> = request.body;
		if ( Request.UserClass.IsLoggedIn() ) {
			Response.Data = await DB_GithubReleases.find();
		}

		response.json( Response );
	} );

	Url = CreateUrl( EChangelogUrl.branches );
	Api.get( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Changelog_GetBranches = {
			...DefaultResponseSuccess,
			Data: []
		};

		const Request : TRequest_Changelog_GetBranches<true> = request.body;
		if ( Request.UserClass.IsLoggedIn() ) {
			Response.Data = await DB_GithubBranches.find();
		}

		response.json( Response );
	} );
}
