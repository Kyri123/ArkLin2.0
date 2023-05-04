import { API_QueryLib }                   from "./API_Query.Lib";
import { DefaultSystemUsage }             from "@shared/Default/Server.Default";
import { ESysUrl }                        from "@shared/Enum/Routing";
import type { TResponse_System_Getusage } from "@app/Types/API_Response";
import type { SystemUsage }                    from "@server/MongoDB/DB_Usage";

export class API_System {
	static async GetSystemUsage() : Promise<SystemUsage> {
		const Data = await API_QueryLib.GetFromAPI<TResponse_System_Getusage>( ESysUrl.usage );
		if ( Data.Data ) {
			return Data.Data;
		}
		return DefaultSystemUsage();
	}
}
