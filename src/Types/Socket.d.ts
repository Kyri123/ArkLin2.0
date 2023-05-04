import type { DefaultEventsMap } from "socket.io/dist/typed-events";
import type { SystemUsage }      from "./Systeminformation";
import type {
	Cluster,
	Instance
}                                from "../../Types/MongoDB";

export type TRedisKeys = "Systeminformation" | "Releases";

interface IEmitEvents extends DefaultEventsMap {
	Connect : () => void;
	OnSystemUpdate : ( Usage : SystemUsage ) => void;
	OnPanelLogUpdated : ( Log : string[] ) => void;
	OnServerUpdated : ( Updated : Record<string, Instance> ) => void;
	OnServerRemoved : () => void;
	OnClusterUpdated : ( Updated : Record<string, Cluster> ) => void;
	OnClusterRemoved : () => void;
	SteamApiUpdated : () => void;
}

type IListenEvents = DefaultEventsMap;
