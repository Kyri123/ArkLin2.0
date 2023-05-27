import { AUTHTOKEN } from "@app/Lib/constance";
import {
	apiHandleError,
	apiPublic,
	getAuthToken
} from "@app/Lib/tRPC";
import type { LoaderFunction } from "react-router-dom";
import {
	json,
	redirect
} from "react-router-dom";


export interface AuthLoaderProps {
	hasAuth: boolean,
	token: string
}

const loader: LoaderFunction = async( { request } ) => {
	const url = new URL( request.url );

	const token = getAuthToken().clearWs();
	let hasAuth = token !== "";
	if( token !== "" ) {
		const result = await apiPublic.validate.validateSession.query( { token } ).catch( apiHandleError );
		if( result ) {
			if( result.tokenValid ) {
				hasAuth = true;
			} else {
				window.localStorage.setItem( AUTHTOKEN, "" );
				hasAuth = false;
			}
		} else {
			hasAuth = false;
		}
	}

	if( !hasAuth && ( !url.pathname.startsWith( "/auth" ) && !url.pathname.startsWith( "/error" ) ) ) {
		return redirect( "/auth/login" );
	}

	if( hasAuth && ( !url.pathname.startsWith( "/app" ) && !url.pathname.startsWith( "/error" ) ) ) {
		return redirect( "/app" );
	}

	return json<AuthLoaderProps>( { hasAuth, token } );
};

export { loader };

