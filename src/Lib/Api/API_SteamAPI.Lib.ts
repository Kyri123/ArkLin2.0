import { API_QueryLib } from "./API_Query.Lib";
import { ESteamApiUrl } from "../../Shared/Enum/Routing";
import { ISteamApiMod } from "../../Shared/Api/SteamAPI";

export class API_SteamAPILib {
  static async GetMods(Mods: number[]): Promise<Record<number, ISteamApiMod>> {
    const Response = await API_QueryLib.PostToAPI<Record<number, ISteamApiMod>>(
      ESteamApiUrl.getmods,
      {
        modsIds: Mods,
      }
    );
    if (Response.Data) {
      return Response.Data;
    }
    return {};
  }
}
