import { IAPIResponseBase } from "../../Shared/Type/API_Response";
import { TServerUrls }      from "../../Shared/Enum/Routing";
import { IAPIRequestBase }  from "../../Shared/Type/API_Request";

export class API_QueryLib {
	static async PostToAPI<T extends IAPIResponseBase = IAPIResponseBase<false, any>, D extends IAPIRequestBase = any>(
		Path : TServerUrls,
		Data : D = {} as D
	) : Promise<T> {
		const Token = window.localStorage.getItem( "AuthToken" );
		const requestOptions : RequestInit = {
			method: "POST",
			headers: {
				Authorization: "Bearer " + Token || "",
				"User-Agent": "Frontend",
				"Content-Type": "application/json"
			},
			body: JSON.stringify( Data )
		};

		try {
			const Resp : Response | void = await fetch(
				`/api/v1/${ Path }`,
				requestOptions
			).catch( console.error );
			if ( Resp ) {
				if ( Resp.ok && Resp.status === 200 ) {
					const Response = ( await Resp.json() ) as IAPIResponseBase<false, T>;
					Response.Reached = true;
					return Response as T;
				}
			}
		}
		catch ( e ) {
			console.error( e );
		}

		return {
			Auth: false,
			Success: false,
			Message: {
				Title: "API konnte nicht erreicht werden!",
				Message:
					"Leider konnte keine verbindung zur API aufgebaut werden... Ist die API offline?",
				AlertType: "danger"
			}
		} as T;
	}

	static async GetFromAPI<T extends IAPIResponseBase = IAPIResponseBase<false, any>, D extends IAPIRequestBase = any>(
		Path : TServerUrls,
		Data : D = {} as D
	) : Promise<T> {
		const RequestData : string[] = [];

		if ( Data ) {
			if ( typeof Data === "object" && !Array.isArray( Data ) ) {
				for ( const [ Key, Value ] of Object.entries( Data ) ) {
					RequestData.push( `${ Key }=${ Value }` );
				}
			}
		}

		const Token = window.localStorage.getItem( "AuthToken" );
		const requestOptions : RequestInit = {
			method: "GET",
			headers: {
				Authorization: "Bearer " + Token || "",
				"User-Agent": "Frontend",
				"Content-Type": "application/json"
			}
		};

		const Resp : Response | void = await fetch(
			`/api/v1/${ Path }?${ RequestData.join( "&" ) }`,
			requestOptions
		).catch( console.error );
		if ( Resp ) {
			if ( Resp.ok && Resp.status === 200 ) {
				const Response = ( await Resp.json() ) as IAPIResponseBase<false, T>;
				Response.Reached = true;
				return Response as T;
			}
		}

		return {
			Auth: false,
			Success: false,
			Message: {
				Title: "API konnte nicht erreicht werden!",
				Message:
					"Leider konnte keine verbindung zur API aufgebaut werden... Ist die API offline?",
				AlertType: "danger"
			}
		} as T;
	}
}
