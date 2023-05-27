import type { Cluster } from "@server/MongoDB/MongoCluster";
import type { Instance } from "@server/MongoDB/MongoInstances";
import { createContext } from "react";


export default createContext<{
	clusterData: Record<string, Cluster>,
	instanceData: Record<string, Instance>,
	hasData: boolean,
	getAllServer: () => Promise<void>
}>( {
			clusterData: {},
			instanceData: {},
			hasData: false,
			getAllServer: () => Promise.resolve()
		} );
