import type { LoaderFunction } from "react-router-dom";
import {
	json,
	redirect
}                              from "react-router-dom";
import {
	tRPC_handleError,
	tRPC_Public,
	tRPC_token
}                              from "@app/Lib/tRPC";
import { AUTHTOKEN }           from "@app/Lib/constance";

export interface AuthLoaderProps {
	hasAuth : boolean,
	token : string
}

const loader : LoaderFunction = async( { request } ) => {
	const Url = new URL( request.url );

	const token = tRPC_token().clearWs();
	let hasAuth = token !== "";
	if ( token !== "" ) {
		const result = await tRPC_Public.validate.validateSession.query( { token } ).catch( tRPC_handleError );
		if ( result ) {
			if ( result.tokenValid ) {
				hasAuth = true;
			}
			else {
				window.localStorage.setItem( AUTHTOKEN, "" );
				hasAuth = false;
			}
		}
		else {
			hasAuth = false;
		}
	}

	if ( !hasAuth && ( !Url.pathname.startsWith( "/auth" ) && !Url.pathname.startsWith( "/error" ) ) ) {
		return redirect( "/auth/login" );
	}

	if ( hasAuth && ( !Url.pathname.startsWith( "/app" ) && !Url.pathname.startsWith( "/error" ) ) ) {
		return redirect( "/app" );
	}

	return json<AuthLoaderProps>( { hasAuth, token } );
};

export { loader };
