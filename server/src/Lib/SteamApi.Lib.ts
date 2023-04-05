import DB_Instances       from "../MongoDB/DB_Instances";
import * as https         from "https";
import { RequestOptions } from "https";

export async function GetAllModIds() : Promise<number[]> {
	let ModIdArray : number[] = [];
	for await ( const Instance of DB_Instances.find() ) {
		ModIdArray = ModIdArray.concat( Instance.ArkmanagerCfg.ark_GameModIds );
	}
	return [ ...new Set( ModIdArray ) ];
}

export async function QuerySteamAPI(
	Path : string,
	PayloadData : any,
	Method : "POST" | "GET" = "POST"
) : Promise<string> {
	return await new Promise( ( Resolve ) => {
		const Data = Object.keys( PayloadData )
			.map( ( key ) => {
				const value = PayloadData[ key ];
				if ( Array.isArray( value ) ) {
					return value
						.map( function( value, index ) {
							return key + "[" + index + "]=" + value;
						} )
						.join( "&" );
				}
				else if ( Buffer.isBuffer( value ) ) {
					return key + "=" + value.toString( "hex" ).replace( /../g, "%$&" );
				}
				else {
					return key + "=" + encodeURIComponent( value );
				}
			} )
			.join( "&" );

		const options : RequestOptions = {
			hostname: "api.steampowered.com",
			path: Path,
			method: Method
		};

		if ( Method === "GET" ) {
			options.path += "/?" + Data;
		}
		else {
			options.headers = {
				"Content-Type": "application/x-www-form-urlencoded",
				"Content-Length": Data.length
			};
		}

		const Request = https.request( options, ( Resource ) => {
			if ( Resource.statusCode !== 200 ) {
				Resolve( "{ error: true }" );
			}

			let Data = "";
			Resource.on( "data", ( ReData ) => ( Data += ReData ) );
			Resource.on( "end", () => Resolve( Data ) );
		} );

		if ( Method === "POST" ) {
			Request.end( Data );
		}
		else {
			Request.end();
		}
	} );
}
