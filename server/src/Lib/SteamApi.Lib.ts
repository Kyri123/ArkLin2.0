import MongoInstances from "@server/MongoDB/MongoInstances";
import type { RequestOptions } from "https";
import * as https from "https";


export async function getAllModIds(): Promise<number[]> {
	const modIds = new Set<number>();
	for await ( const instance of MongoInstances.find() ) {
		for( const modId of instance.ArkmanagerCfg.ark_GameModIds ) {
			modIds.add( modId );
		}
		if( instance.ArkmanagerCfg.ark_TotalConversionMod ) {
			modIds.add( parseInt( instance.ArkmanagerCfg.ark_TotalConversionMod ) );
		}
		if( instance.ArkmanagerCfg.serverMapModId ) {
			modIds.add( parseInt( instance.ArkmanagerCfg.serverMapModId ) );
		}
	}
	return Array.from( modIds );
}

export async function querySteamAPI(
	path: string,
	payloaddata: any,
	method: "POST" | "GET" = "POST"
): Promise<string> {
	return await new Promise( Resolve => {
		const data = Object.keys( payloaddata )
			.map( key => {
				const value = payloaddata[ key ];
				if( Array.isArray( value ) ) {
					return value
						.map( ( value, index ) => key + "[" + index + "]=" + value )
						.join( "&" );
				} else if( Buffer.isBuffer( value ) ) {
					return key + "=" + value.toString( "hex" ).replace( /../g, "%$&" );
				} else {
					return key + "=" + encodeURIComponent( value );
				}
			} )
			.join( "&" );

		const options: RequestOptions = {
			hostname: "api.steampowered.com",
			path: path,
			method: method
		};

		if( method === "GET" ) {
			options.path += "/?" + data;
		} else {
			options.headers = {
				"Content-Type": "application/x-www-form-urlencoded",
				"Content-Length": data.length
			};
		}

		const request = https.request( options, Resource => {
			if( Resource.statusCode !== 200 ) {
				Resolve( "{ error: true }" );
			}

			let data = "";
			Resource.on( "data", Redata => ( data += Redata ) );
			Resource.on( "end", () => Resolve( data ) );
		} );

		if( method === "POST" ) {
			request.end( data );
		} else {
			request.end();
		}
	} );
}
