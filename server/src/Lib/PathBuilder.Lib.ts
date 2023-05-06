import * as process from "process";
import path         from "path";
import { BC }       from "@server/Lib/System.Lib";

export function CreateUrl( Url : string ) : string {
	if ( process.env.API_BASE_URL ) {
		if ( !process.env.API_BASE_URL.endsWith( "/" ) ) {
			process.env.API_BASE_URL += "/";
		}
		SystemLib.Log( "routing",
			"Install Router",
			BC( "Red" ),
			`${ process.env.API_BASE_URL }${ Url }`
		);
		return `${ process.env.API_BASE_URL }${ Url }`;
	}
	SystemLib.Log( "routing",
		"Install Router",
		BC( "Red" ),
		`/api/v1/${ Url }`
	);
	return `/api/v1/${ Url }`;
}

export function ToRealDir( Dir : string ) : string {
	return path.join( process.env.APPEND_BASEDIR, Dir );
}
