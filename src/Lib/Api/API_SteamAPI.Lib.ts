import { API_QueryLib }                    from "./API_Query.Lib";
import { ESteamApiUrl }                    from "@shared/Enum/Routing";
import type { ISteamApiMod }               from "@app/Types/SteamAPI";
import type { TResponse_SteamApi_Getmods } from "@app/Types/API_Response";

export class API_SteamAPILib {
	static async GetMods( Mods : number[] ) : Promise<Record<number, ISteamApiMod>> {
		const Response = await API_QueryLib.PostToAPI<TResponse_SteamApi_Getmods>(
			ESteamApiUrl.getmods,
			{
				modsIds: Mods
			}
		);
		if ( Response.Data ) {
			return Response.Data;
		}
		return {};
	}
}
