import { API_QueryLib }                   from "./API_Query.Lib";
import type { SystemUsage }               from "@shared/Type/Systeminformation";
import { DefaultSystemUsage }             from "@shared/Default/Server.Default";
import { ESysUrl }                        from "@shared/Enum/Routing";
import type { TResponse_System_Getusage } from "@shared/Type/API_Response";

export class API_System {
	static async GetSystemUsage() : Promise<SystemUsage> {
		const Data = await API_QueryLib.GetFromAPI<TResponse_System_Getusage>( ESysUrl.usage );
		if ( Data.Data ) {
			return Data.Data;
		}
		return DefaultSystemUsage();
	}
}
