import * as core from "express-serve-static-core";
import { Request, Response } from "express-serve-static-core";
import { CreateUrl } from "../Lib/PathBuilder.Lib";
import { IAPIResponseBase } from "../../../src/Types/API";
import fs from "fs";
import { IRequestBody } from "../Types/Express";
import { EPerm } from "../../../src/Shared/Enum/User.Enum";
import { ConfigManager } from "../Lib/ConfigManager.Lib";
import { EPanelUrl } from "../../../src/Shared/Enum/Routing";

export default function (Api: core.Express) {
  let Url = CreateUrl(EPanelUrl.log);
  SystemLib.Log(
    "Install Router",
    SystemLib.ToBashColor("Red"),
    Url,
    SystemLib.ToBashColor("Default"),
    "| Mode:",
    SystemLib.ToBashColor("Red"),
    "GET"
  );
  Api.get(Url, async (request: Request, response: Response) => {
    const Response: IAPIResponseBase<string[]> = {
      Auth: false,
      Success: true,
      Data: [],
    };

    const Request: IRequestBody = request.body;
    if (Request.UserClass.HasPermission(EPerm.PanelLog)) {
      if (fs.existsSync(__LogFile)) {
        Response.Data = fs
          .readFileSync(__LogFile)
          .toString()
          .split("\n")
          .reverse();
      }
    }

    response.json(Response);
  });

  Url = CreateUrl(EPanelUrl.restart);
  SystemLib.Log(
    "Install Router",
    SystemLib.ToBashColor("Red"),
    Url,
    SystemLib.ToBashColor("Default"),
    "| Mode:",
    SystemLib.ToBashColor("Red"),
    "POST"
  );
  Api.post(Url, async (request: Request, response: Response) => {
    const Response: IAPIResponseBase<string[]> = {
      Auth: false,
      Success: true,
      Data: [],
    };

    const Request: IRequestBody = request.body;
    if (Request.UserClass.HasPermission(EPerm.ManagePanel)) {
      SystemLib.LogWarning(
        "User Request:",
        SystemLib.ToBashColor("Red"),
        "RESTART"
      );
      process.exit(0);
    }

    response.json(Response);
  });

  Url = CreateUrl(EPanelUrl.setconfig);
  SystemLib.Log(
    "Install Router",
    SystemLib.ToBashColor("Red"),
    Url,
    SystemLib.ToBashColor("Default"),
    "| Mode:",
    SystemLib.ToBashColor("Red"),
    "POST"
  );
  Api.post(Url, async (request: Request, response: Response) => {
    const Response: IAPIResponseBase = {
      Auth: false,
      Success: false,
      Message: {
        AlertType: "danger",
        Message: `Fehler beim verarbeiten der Daten.`,
        Title: "Fehler!",
      },
    };

    const Request: IRequestBody<{
      Config?: string;
      Data?: any;
    }> = request.body;
    if (
      Request.UserClass.HasPermission(EPerm.PanelSettings) &&
      Request.Config &&
      Request.Data
    ) {
      if (ConfigManager.Write(Request.Config, Request.Data)) {
        Response.Success = true;
        Response.Message = {
          AlertType: "success",
          Message: `Konfiguration wurde bearbeitet. Bitte starte das Panel neu um die Änderungen zu Übernehmen.`,
          Title: "Gespeichert",
        };
      }
    }

    response.json(Response);
  });

  Url = CreateUrl(EPanelUrl.getconfig);
  SystemLib.Log(
    "Install Router",
    SystemLib.ToBashColor("Red"),
    Url,
    SystemLib.ToBashColor("Default"),
    "| Mode:",
    SystemLib.ToBashColor("Red"),
    "GET"
  );
  Api.get(Url, async (request: Request, response: Response) => {
    const Response: IAPIResponseBase = {
      Auth: false,
      Success: true,
      Data: {},
    };

    const Request: IRequestBody<{
      Config: string;
    }> = request.body;
    if (
      Request.UserClass.HasPermission(EPerm.PanelSettings) &&
      Request.Config
    ) {
      Response.Data = ConfigManager.Get(Request.Config);
    }

    response.json(Response);
  });
}
