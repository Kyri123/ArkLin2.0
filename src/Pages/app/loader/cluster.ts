import { apiAuth } from "@app/Lib/tRPC";
import type { Cluster } from "@server/MongoDB/MongoCluster";
import type { LoaderFunction } from "react-router-dom";
import { json } from "react-router-dom";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ClusterLoaderProps {
	clusters: Cluster[]
}

const loader: LoaderFunction = async() => {
	const clustersResult = await apiAuth.server.clusterManagement.getAllCluster.query();
	const clusters: Cluster[] = clustersResult || [];
	return json<ClusterLoaderProps>( { clusters } );
};

export { loader };

