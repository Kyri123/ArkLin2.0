import { apiAuth } from "@app/Lib/tRPC";
import { sendWithServerPermission } from "@page/app/loader/func/functions";
import type { LoaderFunction } from "react-router-dom";


export interface ServerLogsLoaderProps {
	logFiles: Record<string, string>
}


const loader: LoaderFunction = async( { params } ) => {
	const { instanceName } = params;

	const query = await apiAuth.server.log.getServerLogs.query( { instanceName: instanceName! } );
	const logFiles = query || {};

	return sendWithServerPermission<ServerLogsLoaderProps>( {
		logFiles
	}, params );
};

export { loader };

