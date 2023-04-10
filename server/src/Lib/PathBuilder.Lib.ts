import * as process    from "process";
import { TServerUrls } from "../../../src/Shared/Enum/Routing";
import path            from "path";

export function CreateUrl( Url : TServerUrls ) : string {
	if ( process.env.API_BASE_URL ) {
		if ( !process.env.API_BASE_URL.endsWith( "/" ) ) {
			process.env.API_BASE_URL += "/";
		}
		return `${ process.env.API_BASE_URL }${ Url }`;
	}
	return `/api/v1/${ Url }`;
}

export function ToRealDir( Dir : string ) : string {
	return path.join( process.env.APPEND_BASEDIR, Dir );
}
