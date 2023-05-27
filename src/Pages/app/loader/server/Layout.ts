import { sendWithServerPermission } from "@page/app/loader/func/functions";
import type { LoaderFunction } from "react-router-dom";


export interface ServerLayoutLoaderProps {
	instanceName: string
}


const loader: LoaderFunction = async( { params } ) => sendWithServerPermission<ServerLayoutLoaderProps>( {
	instanceName: params.instanceName!
}, params );

export { loader };

