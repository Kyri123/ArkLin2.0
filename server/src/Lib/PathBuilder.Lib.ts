import * as process     from "process";
import type { TServerUrls }  from "../../../src/Shared/Enum/Routing";
import path             from "path";
import type { TPermissions } from "../../../src/Shared/Enum/User.Enum";

export function CreateUrl( Url : TServerUrls ) : string {
	if ( process.env.API_BASE_URL ) {
		if ( !process.env.API_BASE_URL.endsWith( "/" ) ) {
			process.env.API_BASE_URL += "/";
		}
		return `${ process.env.API_BASE_URL }${ Url }`;
	}
	return `/api/v1/${ Url }`;
}

export function CreateUrlV2( Url : TServerUrls, As : "GET" | "POST", Perm? : TPermissions ) : [ string, TPermissions | undefined ] {
	let EndUrl = `/api/v1/${ Url }`;
	if ( process.env.API_BASE_URL ) {
		if ( !process.env.API_BASE_URL.endsWith( "/" ) ) {
			process.env.API_BASE_URL += "/";
		}
		EndUrl = `${ process.env.API_BASE_URL }${ Url }`;
	}

	SystemLib.Log(
		"Install Router",
		SystemLib.ToBashColor( "Red" ),
		EndUrl,
		SystemLib.ToBashColor( "Default" ),
		"|  Mode:",
		SystemLib.ToBashColor( "Red" ),
		As
	);
	return [ EndUrl, Perm ];
}

export function ToRealDir( Dir : string ) : string {
	return path.join( process.env.APPEND_BASEDIR, Dir );
}
