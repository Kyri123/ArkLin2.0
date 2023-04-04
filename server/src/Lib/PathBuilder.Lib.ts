import * as process    from "process";
import { TServerUrls } from "../../../src/Shared/Enum/Routing";

export function CreateUrl( Url : TServerUrls ) : string {
	if ( process.env.API_BASE_URL ) {
		if ( !process.env.API_BASE_URL.endsWith( "/" ) ) {
			process.env.API_BASE_URL += "/";
		}
		return `${ process.env.API_BASE_URL }${ Url }`;
	}
	return `/api/v1/${ Url }`;
}

export function MakeRandomID( length : number, useSplitter = false ) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while ( counter < length ) {
		result += characters.charAt( Math.floor( Math.random() * charactersLength ) );
		if ( useSplitter && counter % 5 === 4 ) {
			result += "-"
		}
		counter += 1;
	}
	if ( result.endsWith( "-" ) ) {
		return result.slice( 0, result.length - 1 );
	}
	return result;
}