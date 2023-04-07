import { API_QueryLib }              from "./API_Query.Lib";
import { ISystemUsage }              from "../../Shared/Type/Systeminformation";
import { DefaultSystemUsage }        from "../../Shared/Default/Server.Default";
import { ESysUrl }                   from "../../Shared/Enum/Routing";
import { TResponse_System_Getusage } from "../../Shared/Type/API_Response";

export class API_System {
	static async GetSystemUsage() : Promise<ISystemUsage> {
		const Data = await API_QueryLib.GetFromAPI<TResponse_System_Getusage>( ESysUrl.usage );
		if ( Data.Data ) {
			return Data.Data;
		}
		return DefaultSystemUsage();
	}
}
