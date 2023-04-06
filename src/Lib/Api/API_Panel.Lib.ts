import { API_QueryLib }     from "./API_Query.Lib";
import { IAPIResponseBase } from "../../Types/API";
import { EPanelUrl }        from "../../Shared/Enum/Routing";

export class API_PanelLib {
	static async Restart() : Promise<void> {
		await API_QueryLib.PostToAPI<IAPIResponseBase>( EPanelUrl.restart, {} );
	}

	static async GetLog() : Promise<string[]> {
		const Data = await API_QueryLib.GetFromAPI<string[]>( EPanelUrl.log );
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

		const Data = await API_QueryLib.GetFromAPI<Record<string, any>>(
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

	static async SetConfig( Config : string, Data : any ) : Promise<IAPIResponseBase> {
		return await API_QueryLib.PostToAPI<IAPIResponseBase>( EPanelUrl.setconfig, {
			Config: Config,
			Data: Data
		} );
	}
}
