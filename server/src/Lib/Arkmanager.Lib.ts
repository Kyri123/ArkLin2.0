import { IInstanceData } from "../../../src/Shared/Type/ArkSE";
import path from "path";
import { MakeRandomID } from "./PathBuilder.Lib";
import fs from "fs";
import process from "process";

export function ConfigToJSON(Content: string): Partial<IInstanceData> {
  const InstanceData: Partial<IInstanceData> = {
    Flags: {},
    Options: {},
  };

  const ClearInstance: string[] = Content.split("\n");
  for (let Line = 0; Line < ClearInstance.length; ++Line) {
    const [DataKey, RawDataValue] = ClearInstance[Line].split("#")[0]
      .trim()
      .split("=", 2) as any[];
    if (DataKey.trim().slice(0, 1) === "#" || !DataKey || !RawDataValue) {
      continue;
    }

    let DataValue = RawDataValue.replaceAll("'", "");

    if (DataKey === "ark_GameModIds") {
      DataValue = DataValue.split(",")
        .map((E) => parseInt(E))
        .filter((e) => !isNaN(e));
      DataValue = [...new Set(DataValue)];
    } else if (DataKey.slice(0, 7) === "arkopt_" && InstanceData.Options) {
      const key = DataKey.replace("arkopt_", "");
      InstanceData.Options[key] = DataValue;
      continue;
    } else if (DataKey.slice(0, 8) === "arkflag_" && InstanceData.Flags) {
      const key = DataKey.replace("arkflag_", "");
      InstanceData.Flags[key] = DataValue;
      continue;
    } else if (DataValue.trim() === "") {
      // SKIP!
    } else if (!isNaN(Number(DataValue))) {
      DataValue = Number(DataValue);
    } else if (DataValue === "True") {
      DataValue = true;
    } else if (DataValue === "False") {
      DataValue = false;
    }

    InstanceData[DataKey] = DataValue;
  }

  return InstanceData;
}

export function JSONtoConfig(Content: Partial<IInstanceData>): string {
  const Lines: string[] = [];

  if (!Content.Options) {
    Content.Options = {};
  }
  Content.Options.culture = "en";

  for (const [Key, Value] of Object.entries(Content)) {
    if (Value === "") {
      Lines.push(`${Key}='${Value}'`);
    } else if (Key === "Flags" || Key === "Options") {
      for (const [ExtraKey, ExtraValue] of Object.entries(Value)) {
        Lines.push(
          `${
            Key === "Flags" ? "arkflag_" : "arkopt_"
          }${ExtraKey}='${ExtraValue}'`
        );
      }
    } else if (Array.isArray(Value)) {
      Lines.push(`${Key}='${(Value as number[]).join(",")}'`);
    } else if (typeof Value === "boolean") {
      Lines.push(`${Key}='${Value ? "True" : "False"}'`);
    } else {
      Lines.push(`${Key}='${Value}'`);
    }
  }

  return Lines.join("\n");
}

export function GetDefaultInstanceData(Servername: string): IInstanceData {
  return {
    arkMaxBackupSizeMB: 4096,
    arkNoPortDecrement: true,
    arkStartDelay: 0,
    arkautorestartfile: "ShooterGame/Saved/.autorestart",
    arkprecisewarn: true,
    chatCommandRestartCancel: "/cancelupdate",
    discordWebhookURL: "",
    msgWarnCancelled: "Restart cancelled by player request",
    msgWarnRestartMinutes:
      "This ARK server will shutdown for a restart in %d minutes",
    msgWarnRestartSeconds:
      "This ARK server will shutdown for a restart in %d seconds",
    msgWarnShutdownMinutes: "This ARK server will shutdown in %d minutes",
    msgWarnShutdownSeconds: "This ARK server will shutdown in %d seconds",
    msgWarnUpdateMinutes:
      "This ARK server will shutdown for an update in %d minutes",
    msgWarnUpdateSeconds:
      "This ARK server will shutdown for an update in %d seconds",
    noNotifyWarning: true,
    notifyCommand:
      'echo "$msg" | mailx -s "Message from instance ${instance} on server ${HOSTNAME}" "email@domain.com"',
    notifyMsgServerTerminated: "Server exited - restarting",
    notifyMsgServerUp: "Server is up",
    notifyMsgShuttingDown: "Shutting down",
    notifyMsgStarting: "Starting",
    notifyMsgStoppedListening: "Server has stopped listening - restarting",
    notifyTemplate:
      "Message from instance {instance} on server {server}: {msg}",
    Flags: {},
    Options: {
      culture: "en",
    },
    arkAutoUpdateOnStart: true,
    arkBackupPreUpdate: true,
    ark_GameModIds: [],
    ark_MaxPlayers: 70,
    ark_Port: 7778,
    ark_QueryPort: 27015,
    ark_RCONEnabled: true,
    ark_RCONPort: 32330,
    ark_ServerAdminPassword: MakeRandomID(10),
    ark_ServerPassword: "",
    ark_SessionName: "[ARKLIN2] ArkServer",
    ark_TotalConversionMod: 0,
    arkbackupcompress: true,
    arkbackupdir: path.join(__server_backups, Servername),
    arkserverroot: path.join(__server_dir, Servername),
    logdir: path.join(__server_logs, Servername),
    arkStagingDir: path.join(__server_backups, "Staging"),
    arkserverexec: "ShooterGame/Binaries/Linux/ShooterGameServer",
    arkwarnminutes: 0,
    serverMap: "TheIsland",
    serverMapModId: 0,
    panel_publicip: "0.0.0.0",
  };
}

export function FillWithDefaultValues(
  Servername: string,
  Content: Partial<IInstanceData>
): IInstanceData {
  if (global.__PublicIP) {
    Content.panel_publicip = __PublicIP;
  }

  Content.arkbackupdir = path.join(
    process.env.APPEND_BASEDIR || "/",
    __server_backups,
    Servername
  );
  Content.arkserverroot = path.join(
    process.env.APPEND_BASEDIR || "/",
    __server_dir,
    Servername
  );
  Content.logdir = path.join(
    process.env.APPEND_BASEDIR || "/",
    __server_logs,
    Servername
  );
  Content.arkStagingDir = path.join(
    process.env.APPEND_BASEDIR || "/",
    __server_backups,
    "Staging"
  );

  try {
    fs.mkdirSync(path.join(__server_backups, Servername), { recursive: true });
    fs.mkdirSync(path.join(__server_logs, Servername), { recursive: true });
  } catch (e) {}

  return {
    ...GetDefaultInstanceData(Servername),
    ...Content,
  };
}
