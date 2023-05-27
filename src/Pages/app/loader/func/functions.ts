import User from "@app/Lib/User.Lib";
import {
	apiAuth,
	apiHandleError,
	getAuthToken
} from "@app/Lib/tRPC";
import type { Cluster } from "@server/MongoDB/MongoCluster";
import type { Instance } from "@server/MongoDB/MongoInstances";
import type { SystemUsage } from "@server/MongoDB/MongoUsage";
import type { TPermissions } from "@shared/Enum/User.Enum";
import type {
	Params
} from "react-router-dom";
import {
	json,
	redirect
} from "react-router-dom";


export const fetchMainData = async(): Promise<[ number[], Record<string, Instance>, Record<string, Cluster>, SystemUsage ] | undefined> => {
	const [ globalState, server, cluster, usage ] = await Promise.all( [
		apiAuth.globaleState.state.query().catch( apiHandleError ),
		apiAuth.globaleState.getallserver.query().catch( apiHandleError ),
		apiAuth.globaleState.getallcluster.query().catch( apiHandleError ),
		apiAuth.globaleState.systemUsage.query().catch( apiHandleError )
	] );

	if( globalState && server && cluster && usage ) {
		return [ globalState, server, cluster, usage ];
	}

	return undefined;
};

export function sendWithPermission<T extends object>( data: T, permission: TPermissions ): Response {
	const user = new User( getAuthToken() );

	if( !user.hasPermission( permission ) ) {
		return redirect( "/error/401" );
	}
	return json<T>( data );
}

export function sendWithServerPermission<T extends object>( data: T, params: Params ): Response {
	const { instance } = params;
	const user = new User( getAuthToken() );

	if( !user.hasPermissionForServer( instance || "NO!" ) ) {
		return redirect( "/error/401" );
	}

	return json<T>( data );
}
