import type { LoaderFunction } from "react-router-dom";
import { json }                from "react-router-dom";

const loader : LoaderFunction = ( { request } ) => {
	console.log( request.url );

	return json( {} );
};

export { loader };
