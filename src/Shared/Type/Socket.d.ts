import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { ISystemUsage }     from "./Systeminformation";
import { IMO_Instance }     from "../Api/MongoDB";

export type TRedisKeys = "Systeminformation" | "Releases";

interface IEmitEvents extends DefaultEventsMap {
	Connect : () => void;
	OnSystemUpdate : ( Usage : ISystemUsage ) => void;
	OnPanelLogUpdated : ( Log : string[] ) => void;
	OnServerUpdated : ( Updated : Record<string, IMO_Instance> ) => void;
	OnServerRemoved : () => void;
	"SteamApiUpdated" : () => void;
}

type IListenEvents = DefaultEventsMap