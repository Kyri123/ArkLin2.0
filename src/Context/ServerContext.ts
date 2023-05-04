import { createContext } from "react";
import type {
	IMO_Cluster,
	TMO_Instance
}                        from "../Types/MongoDB";

export default createContext<{
	ClusterData : Record<string, IMO_Cluster>;
	InstanceData : Record<string, TMO_Instance>;
	HasData : boolean;
}>( {
	InstanceData: {},
	ClusterData: {},
	HasData: false
} );
