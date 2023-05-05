import type { Instance }    from "@server/MongoDB/DB_Instances";
import type { Cluster }     from "@server/MongoDB/DB_Cluster";
import type { SystemUsage } from "@server/MongoDB/DB_Usage";
import {
	tRPC_Auth,
	tRPC_handleError
}                           from "@app/Lib/tRPC";

export const fetchMainData = async() : Promise<[ number[], Record<string, Instance>, Record<string, Cluster>, SystemUsage ] | undefined> => {
	const [ globalState, server, cluster, usage ] = await Promise.all( [
		tRPC_Auth.globaleState.state.query().catch( tRPC_handleError ),
		tRPC_Auth.globaleState.getallserver.query().catch( tRPC_handleError ),
		tRPC_Auth.globaleState.getallcluster.query().catch( tRPC_handleError ),
		tRPC_Auth.globaleState.systemUsage.query().catch( tRPC_handleError )
	] );

	if ( globalState && server && cluster && usage ) {
		return [ globalState, server, cluster, usage ];
	}

	return undefined;
};