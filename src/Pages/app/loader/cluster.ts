import type { LoaderFunction } from "react-router-dom";
import { json }                from "react-router-dom";
import type { Cluster }        from "@server/MongoDB/DB_Cluster";
import { tRPC_Auth }           from "@app/Lib/tRPC";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ClusterLoaderProps {
	clusters : Cluster[];
}
 
const loader : LoaderFunction = async() => {
	const clustersResult = await tRPC_Auth.server.clusterManagement.getAllCluster.query();
	const clusters : Cluster[] = clustersResult || [];
	return json<ClusterLoaderProps>( { clusters } );
};

export { loader };