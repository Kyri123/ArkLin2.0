import type { LoaderFunction } from "react-router-dom";
import {
	json,
	redirect
}                              from "react-router-dom";
import {
	tRPC_handleError,
	tRPC_Public
}                              from "@app/Lib/tRPC";

const loader : LoaderFunction = async( { params } ) => {
	const { token } = params;
	const tokenCheck = await tRPC_Public.validate.validateResetToken.query( { token: token! } ).catch( tRPC_handleError );

	console.log( tokenCheck );
	if ( !tokenCheck?.tokenValid ) {
		return redirect( "/auth/login" );
	}

	return json( {} );
};

export { loader };