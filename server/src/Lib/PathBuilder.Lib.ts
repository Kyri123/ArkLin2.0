import { BC } from "@/server/src/Lib/system.Lib";
import path from "path";
import * as process from "process";


export function createUrl( Url: string ): string {
	if( process.env.API_BASE_URL ) {
		if( !process.env.API_BASE_URL.endsWith( "/" ) ) {
			process.env.API_BASE_URL += "/";
		}
		SystemLib.log( "routing",
			"Install Router",
			BC( "Red" ),
			`${ process.env.API_BASE_URL }${ Url }`
		);
		return `${ process.env.API_BASE_URL }${ Url }`;
	}
	SystemLib.log( "routing",
		"Install Router",
		BC( "Red" ),
		`/api/v1/${ Url }`
	);
	return `/api/v1/${ Url }`;
}

export function toRealDir( Dir: string ): string {
	return path.join( process.env.APPEND_BASEDIR, Dir );
}
