import { API_QueryLib }        from "./API_Query.Lib";
import { IPanelServerConfig }  from "../../Shared/Type/ArkSE";
import {
	IAPIResponseBase,
	TResponse_Server_Addserver,
	TResponse_Server_Cancelaction,
	TResponse_Server_Getallserver,
	TResponse_Server_Getconfigs,
	TResponse_Server_Getglobalstate,
	TResponse_Server_Getlogs,
	TResponse_Server_Removeserver,
	TResponse_Server_Sendcommand,
	TResponse_Server_Setpanelconfig,
	TResponse_Server_Setserverconfig
}                              from "../../Shared/Type/API_Response";
import { EArkmanagerCommands } from "../ServerUtils.Lib";
import { EServerUrl }          from "../../Shared/Enum/Routing";

export class API_ServerLib {
	static async SetServerConfig(
		ServerInstance : string,
		ConfigFile : string,
		Data : any
	) : Promise<TResponse_Server_Setserverconfig> {
		return await API_QueryLib.PostToAPI<TResponse_Server_Setserverconfig>(
			EServerUrl.setserverconfig,
			{
				ConfigFile: ConfigFile,
				ConfigContent: Data,
				ServerInstance: ServerInstance
			}
		);
	}

	static async SetPanelConfig(
		ServerInstance : string,
		Data : Partial<IPanelServerConfig>
	) : Promise<TResponse_Server_Setpanelconfig> {
		return await API_QueryLib.PostToAPI<TResponse_Server_Setpanelconfig>(
			EServerUrl.setpanelconfig,
			{
				ServerInstance: ServerInstance,
				Config: Data
			}
		);
	}

	static async GetConfigFiles(
		ServerInstance : string
	) : Promise<Record<string, string>> {
		const Resp = await API_QueryLib.PostToAPI<TResponse_Server_Getconfigs>(
			EServerUrl.getconfigs,
			{
				ServerInstance: ServerInstance
			}
		);
		return Resp.Data as Record<string, string> || {};
	}

	static async GetConfigFromFile(
		ServerInstance : string,
		LogFile : string
	) : Promise<[ Record<string, any>, string ]> {
		const Resp = await API_QueryLib.PostToAPI<IAPIResponseBase<false, {
			Obj : Record<string, any>;
			String : string;
		}>>( EServerUrl.getconfigs, {
			ServerInstance: ServerInstance,
			LogFile: LogFile
		} );
		return [ Resp.Data?.Obj || {}, Resp.Data?.String || "" ];
	}

	static async GetLogFiles(
		ServerInstance : string
	) : Promise<Record<string, string>> {
		const Resp = await API_QueryLib.PostToAPI<TResponse_Server_Getlogs>(
			EServerUrl.getlogs,
			{
				ServerInstance: ServerInstance
			}
		);
		return Resp.Data as Record<string, string> || {};
	}

	static async GetLogFromFile(
		ServerInstance : string,
		LogFile : string
	) : Promise<string> {
		const Resp = await API_QueryLib.PostToAPI<TResponse_Server_Getlogs>( EServerUrl.getlogs, {
			ServerInstance: ServerInstance,
			LogFile: LogFile
		} );
		return Resp.Data as string || "";
	}

	static async CancelAction( ServerInstance : string ) : Promise<TResponse_Server_Cancelaction> {
		return await API_QueryLib.PostToAPI<TResponse_Server_Cancelaction>( EServerUrl.cancelaction, {
			ServerInstance: ServerInstance
		} );
	}

	static async SendCommandToServer(
		ServerInstance : string,
		Command : EArkmanagerCommands,
		Parameter : string[]
	) : Promise<TResponse_Server_Sendcommand> {
		return await API_QueryLib.PostToAPI<TResponse_Server_Sendcommand>( EServerUrl.sendcommand, {
			ServerInstance: ServerInstance,
			Command: Command,
			Parameter: Parameter
		} );
	}

	static async GetAllServer() : Promise<TResponse_Server_Getallserver> {
		return await API_QueryLib.GetFromAPI<TResponse_Server_Getallserver>(
			EServerUrl.getallserver,
			{}
		);
	}

	static async GetGlobalState() : Promise<number[]> {
		const Data = await API_QueryLib.GetFromAPI<TResponse_Server_Getglobalstate>(
			EServerUrl.getglobalstate,
			{}
		);

		return Data.Data ? Data.Data : [ 0, 0, 0 ];
	}

	static async AddServer(
		Config : IPanelServerConfig
	) : Promise<TResponse_Server_Addserver> {
		return await API_QueryLib.PostToAPI<TResponse_Server_Addserver>(
			EServerUrl.addserver,
			{
				Config: Config
			}
		);
	}

	static async RemoveServer(
		InstanceName : string
	) : Promise<TResponse_Server_Removeserver> {
		return await API_QueryLib.PostToAPI<TResponse_Server_Removeserver>(
			EServerUrl.removeserver,
			{
				InstanceName: InstanceName
			}
		);
	}
}
