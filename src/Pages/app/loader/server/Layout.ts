import type { LoaderFunction }      from "react-router-dom";
import { sendWithServerPermission } from "@page/app/loader/func/functions";

export interface ServerLayoutLoaderProps {
	instanceName : string;
}


const loader : LoaderFunction = async( { params } ) => {
	return sendWithServerPermission<ServerLayoutLoaderProps>( {
		instanceName: params.instanceName!
	}, params );
};

export { loader };