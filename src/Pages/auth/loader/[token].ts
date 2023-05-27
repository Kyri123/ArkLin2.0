import {
    apiHandleError,
    apiPublic
} from "@app/Lib/tRPC";
import type { LoaderFunction } from "react-router-dom";
import {
    json,
    redirect
} from "react-router-dom";


const loader: LoaderFunction = async( { params } ) => {
	const { token } = params;
	const tokenCheck = await apiPublic.validate.validateResetToken.query( { token: token! } ).catch( apiHandleError );

	if( !tokenCheck?.tokenValid ) {
		return redirect( "/auth/login" );
	}

	return json( {} );
};

export { loader };
