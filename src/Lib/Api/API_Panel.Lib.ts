import { API_QueryLib } from "./API_Query.Lib";
import {
	TResponse_Panel_GetConfig,
	TResponse_Panel_Log,
	TResponse_Panel_SetConfig,
	TResponse_Panel_Update
}                       from "../../Shared/Type/API_Response";
import { EPanelUrl }    from "../../Shared/Enum/Routing";

export class API_PanelLib {
	static async Restart() : Promise<void> {
		await API_QueryLib.PostToAPI( EPanelUrl.restart, {} );
	}

	static async TriggerUpdate() : Promise<TResponse_Panel_Update> {
		return await API_QueryLib.PostToAPI( EPanelUrl.update, {} );
	}

	static async GetLog() : Promise<string[]> {
		const Data = await API_QueryLib.GetFromAPI<TResponse_Panel_Log>( EPanelUrl.log );
		if ( Data.Data ) {
			return Data.Data;
		}
		return [ "Fehler beim laden vom Log" ];
	}

	static async GetConfig(
		Config : string | undefined
	) : Promise<Record<string, any>> {
		if ( !Config ) {
			return {};
		}

		const Data = await API_QueryLib.GetFromAPI<TResponse_Panel_GetConfig>(
			EPanelUrl.getconfig,
			{
				Config: Config
			}
		);

		if ( Data.Data ) {
			return Data.Data;
		}
		return {};
	}

	static async SetConfig( Config : string, Data : any ) : Promise<TResponse_Panel_SetConfig> {
		return await API_QueryLib.PostToAPI<TResponse_Panel_SetConfig>( EPanelUrl.setconfig, {
			Config: Config,
			Data: Data
		} );
	}
}
