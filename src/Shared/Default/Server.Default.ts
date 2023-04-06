import {
	IInstanceData,
	IInstanceState,
	IPanelServerConfig
}                       from "../Type/ArkSE";
import { ISystemUsage } from "../Type/Systeminformation";

export function DefaultInstanceState() : IInstanceState {
	return structuredClone<IInstanceState>( {
		IsListen: false,
		State: "NotInstalled",
		Player: 0,
		OnlinePlayerList: [],
		ServerVersion: "0.0",
		ArkmanagerPID: 0,
		ArkserverPID: 0
	} );
}

export function DefaultSystemUsage() : ISystemUsage {
	return structuredClone<ISystemUsage>( {
		UpdateIsRunning: false,
		PanelBuildVersion: "",
		PanelVersionName: "",
		NextPanelBuildVersion: "",
		PanelNeedUpdate: false,
		CPU: 0,
		MemMax: 0,
		MemUsed: 0,
		DiskMax: 0,
		DiskUsed: 0
	} );
}

export function GetRawInstanceData() : IInstanceData {
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
		// eslint-disable-next-line no-template-curly-in-string
		notifyCommand:
			"echo \"$msg\" | mailx -s \"Message from instance ${instance} on server ${HOSTNAME}\" \"email@domain.com\"",
		notifyMsgServerTerminated: "Server exited - restarting",
		notifyMsgServerUp: "Server is up",
		notifyMsgShuttingDown: "Shutting down",
		notifyMsgStarting: "Starting",
		notifyMsgStoppedListening: "Server has stopped listening - restarting",
		notifyTemplate:
			"Message from instance {instance} on server {server}: {msg}",
		Flags: {},
		Options: {
			culture: "en"
		},
		arkAutoUpdateOnStart: true,
		arkBackupPreUpdate: true,
		ark_GameModIds: [],
		ark_MaxPlayers: 70,
		ark_Port: 7778,
		ark_QueryPort: 27015,
		ark_RCONEnabled: true,
		ark_RCONPort: 32330,
		ark_ServerAdminPassword: "",
		ark_ServerPassword: "",
		ark_SessionName: "[ARKLIN2] ArkServer",
		ark_TotalConversionMod: 0,
		arkbackupcompress: true,
		arkbackupdir: "",
		arkserverroot: "",
		logdir: "",
		arkStagingDir: "",
		arkserverexec: "ShooterGame/Binaries/Linux/ShooterGameServer",
		arkwarnminutes: 0,
		serverMap: "TheIsland",
		serverMapModId: 0,
		panel_publicip: "0.0.0.0"
	};
}

export function GetDefaultPanelServerConfig() : IPanelServerConfig {
	return structuredClone<IPanelServerConfig>( {
		AutoUpdateEnabled: false,
		AutoUpdateInterval: 1800000,
		AutoUpdateParameters: [],
		BackupEnabled: false,
		BackupInterval: 1800000,
		MaxBackupfolderSize: 25600
	} );
}
