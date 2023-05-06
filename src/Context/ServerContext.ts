import { createContext } from "react";
import type { Cluster }  from "@server/MongoDB/DB_Cluster";
import type { Instance } from "@server/MongoDB/DB_Instances";

export default createContext<{
	ClusterData : Record<string, Cluster>;
	InstanceData : Record<string, Instance>;
	HasData : boolean;
	GetAllServer : () => Promise<void>
}>( {
	InstanceData: {},
	ClusterData: {},
	HasData: false,
	GetAllServer: () => Promise.resolve()
} );
