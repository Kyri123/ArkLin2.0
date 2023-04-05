import * as core from "express-serve-static-core";
import { Request, Response } from "express-serve-static-core";
import { CreateUrl } from "../Lib/PathBuilder.Lib";
import { IRequestBody } from "../Types/Express";
import { IAPIResponseBase } from "../../../src/Types/API";
import { ESteamApiUrl } from "../../../src/Shared/Enum/Routing";
import { ISteamApiMod } from "../../../src/Shared/Api/SteamAPI";
import DB_SteamAPI_Mods from "../MongoDB/DB_SteamAPI_Mods";

export default function (Api: core.Express) {
  const Url = CreateUrl(ESteamApiUrl.getmods);
  SystemLib.Log(
    "Install Router",
    SystemLib.ToBashColor("Red"),
    Url,
    SystemLib.ToBashColor("Default"),
    "| Mode:",
    SystemLib.ToBashColor("Red"),
    "GET"
  );
  Api.post(Url, async (request: Request, response: Response) => {
    const Response: IAPIResponseBase<Record<number, ISteamApiMod>> = {
      Auth: false,
      Success: true,
      Data: {},
    };

    const Request: IRequestBody<{
      modsIds: number[];
    }> = request.body;

    if (Request.modsIds) {
      for await (const Mod of DB_SteamAPI_Mods.find({
        publishedfileid: Request.modsIds,
      })) {
        if (Response.Data) {
          Response.Data[Mod.publishedfileid] = Mod;
        }
      }
    }

    response.json(Response);
  });
}
