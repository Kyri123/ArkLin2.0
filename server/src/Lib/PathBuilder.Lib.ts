import * as process          from "process";
import type { TServerUrls }  from "@shared/Enum/Routing";
import path                  from "path";
import type { TPermissions } from "@shared/Enum/User.Enum";
import { BC }                from "@server/Lib/System.Lib";

export function CreateUrl( Url : TServerUrls ) : string {
	if ( process.env.API_BASE_URL ) {
		if ( !process.env.API_BASE_URL.endsWith( "/" ) ) {
			process.env.API_BASE_URL += "/";
		}
		SystemLib.Log(
			"Install Router",
			SystemLib.ToBashColor( "Red" ),
			`${ process.env.API_BASE_URL }${ Url }`
		);
		return `${ process.env.API_BASE_URL }${ Url }`;
	}
	SystemLib.Log(
		"Install Router",
		SystemLib.ToBashColor( "Red" ),
		`/api/v1/${ Url }`
	);
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
		BC( "Red" ),
		EndUrl,
		BC( "Default" ),
		"|  Mode:",
		BC( "Red" ),
		As
	);
	return [ EndUrl, Perm ];
}

export function ToRealDir( Dir : string ) : string {
	return path.join( process.env.APPEND_BASEDIR, Dir );
}
