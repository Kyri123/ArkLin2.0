import { API_QueryLib }        from "./API_Query.Lib";
import {
	IFullData,
	IPanelServerConfig
}                              from "../../Shared/Type/ArkSE";
import { IAPIResponseBase }    from "../../Types/API";
import { EArkmanagerCommands } from "../ServerUtils.Lib";
import { EServerUrl }          from "../../Shared/Enum/Routing";

export class API_ServerLib {

	static async SetServerConfig( ServerInstance : string, ConfigFile : string, Data : any ) : Promise<IAPIResponseBase> {
		return await API_QueryLib.PostToAPI<Record<string, string>>( EServerUrl.setserverconfig, {
			ConfigFile: ConfigFile,
			ConfigContent: Data,
			ServerInstance: ServerInstance
		} );
	}

	static async SetPanelConfig( ServerInstance : string, Data : Partial<IPanelServerConfig> ) : Promise<IAPIResponseBase> {
		return await API_QueryLib.PostToAPI<Record<string, string>>( EServerUrl.setpanelconfig, {
			ServerInstance: ServerInstance,
			Config: Data
		} );
	}

	static async GetConfigFiles( ServerInstance : string ) : Promise<Record<string, string>> {
		const Resp = await API_QueryLib.PostToAPI<Record<string, string>>( EServerUrl.getconfigs, {
			ServerInstance: ServerInstance
		} );
		return Resp.Data || {};
	}

	static async GetConfigFromFile( ServerInstance : string, LogFile : string ) : Promise<[ Record<string, any>, string ]> {
		const Resp = await API_QueryLib.PostToAPI<{
			Obj : Record<string, any>,
			String : string
		}>( EServerUrl.getconfigs, {
			ServerInstance: ServerInstance,
			LogFile: LogFile
		} );
		return [ Resp.Data?.Obj || {}, Resp.Data?.String || "" ];
	}

	static async GetLogFiles( ServerInstance : string ) : Promise<Record<string, string>> {
		const Resp = await API_QueryLib.PostToAPI<Record<string, string>>( EServerUrl.getlogs, {
			ServerInstance: ServerInstance
		} );
		return Resp.Data || {};
	}

	static async GetLogFromFile( ServerInstance : string, LogFile : string ) : Promise<string> {
		const Resp = await API_QueryLib.PostToAPI<string>( EServerUrl.getlogs, {
			ServerInstance: ServerInstance,
			LogFile: LogFile
		} );
		return Resp.Data || "";
	}

	static async CancelAction( ServerInstance : string ) {
		return await API_QueryLib.PostToAPI<any>( EServerUrl.cancelaction, {
			ServerInstance: ServerInstance
		} );
	}

	static async SendCommandToServer( ServerInstance : string, Command : EArkmanagerCommands, Parameter : string[] ) {
		return await API_QueryLib.PostToAPI<any>( EServerUrl.sendcommand, {
			ServerInstance: ServerInstance,
			Command: Command,
			Parameter: Parameter
		} );
	}

	static async GetAllServer() {
		return await API_QueryLib.GetFromAPI<IFullData>( EServerUrl.getallserver, {} );
	}

	static async GetGlobalState() : Promise<number[]> {
		const Data = await API_QueryLib.GetFromAPI<number[]>( EServerUrl.getglobalstate, {} );
		return Data.Data ? Data.Data : [ 0, 0, 0 ];
	}

	static async AddServer( Config : IPanelServerConfig ) : Promise<IAPIResponseBase<IPanelServerConfig>> {
		return await API_QueryLib.PostToAPI<IPanelServerConfig>( EServerUrl.addserver, {
			Config: Config
		} );
	}

	static async RemoveServer( InstanceName : string ) : Promise<IAPIResponseBase<IPanelServerConfig>> {
		return await API_QueryLib.PostToAPI<IPanelServerConfig>( EServerUrl.removeserver, {
			InstanceName: InstanceName
		} );
	}
}