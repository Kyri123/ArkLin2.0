import type { Cluster } from "@server/MongoDB/MongoCluster";
import type { Instance } from "@server/MongoDB/MongoInstances";
import type { SystemUsage } from "@server/MongoDB/MongoUsage";
import type { DefaultEventsMap } from "socket.io/dist/typed-events";


interface EmitEvents extends DefaultEventsMap {
	onSystemUpdate: ( Usage: SystemUsage ) => void,
	onFileUpdated: ( File: string, Log: string[] ) => void,
	onServerUpdated: ( Updated: Record<string, Instance> ) => void,
	onServerRemoved: () => void,
	onClusterUpdated: ( Updated: Record<string, Cluster> ) => void,
	onClusterRemoved: () => void,
	onSteamApiUpdated: () => void
}

type ListenEvents = DefaultEventsMap;
