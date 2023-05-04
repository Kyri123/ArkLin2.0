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

export interface AuthLoaderProps {
	hasAuth : boolean;
}

const loader : LoaderFunction = async( { request } ) => {
	const Url = new URL( request.url );

	const token = tRPC_token().clearWs();
	let hasAuth = token !== "";
	if ( token !== "" ) {
		hasAuth = !!( await tRPC_Public.validate.validateSession.query( { token } ).catch( tRPC_handleError ) );
	}

	if ( !hasAuth && ( !Url.pathname.startsWith( "/auth" ) && !Url.pathname.startsWith( "/error" ) ) ) {
		redirect( "/auth/login" );
	}

	if ( hasAuth && Url.pathname.startsWith( "/auth" ) ) {
		redirect( "/home" );
	}

	return json<AuthLoaderProps>( { hasAuth } );
};

export { loader };
