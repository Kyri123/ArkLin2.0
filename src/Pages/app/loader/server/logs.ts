import type { LoaderFunction }      from "react-router-dom";
import { sendWithServerPermission } from "@page/app/loader/func/functions";
import { tRPC_Auth }                from "@app/Lib/tRPC";

export interface ServerLogsLoaderProps {
	logFiles : Record<string, string>;
}


const loader : LoaderFunction = async( { params } ) => {
	const { instanceName } = params;
	
	const query = await tRPC_Auth.server.log.getServerLogs.query( { instanceName: instanceName! } );
	const logFiles = query || {};

	return sendWithServerPermission<ServerLogsLoaderProps>( {
		logFiles
	}, params );
};

export { loader };