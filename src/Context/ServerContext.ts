import { createContext } from "react";
import type {
	Cluster,
	Instance
}                        from "../Types/MongoDB";

export default createContext<{
	ClusterData : Record<string, Cluster>;
	InstanceData : Record<string, Instance>;
	HasData : boolean;
}>( {
	InstanceData: {},
	ClusterData: {},
	HasData: false
} );
