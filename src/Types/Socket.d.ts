import type { DefaultEventsMap } from "socket.io/dist/typed-events";
import type { SystemUsage }           from "@server/MongoDB/DB_Usage";
import type { Instance }              from "@server/MongoDB/DB_Instances";
import type { Cluster }               from "@server/MongoDB/DB_Cluster";

interface EmitEvents extends DefaultEventsMap {
	Connect : () => void;
	OnSystemUpdate : ( Usage : SystemUsage ) => void;
	OnPanelLogUpdated : ( Log : string[] ) => void;
	OnServerUpdated : ( Updated : Record<string, Instance> ) => void;
	OnServerRemoved : () => void;
	OnClusterUpdated : ( Updated : Record<string, Cluster> ) => void;
	OnClusterRemoved : () => void;
	SteamApiUpdated : () => void;
}

type ListenEvents = DefaultEventsMap;
