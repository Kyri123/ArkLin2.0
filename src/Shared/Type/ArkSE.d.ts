import {
	IMongoDB,
	TMO_Instance
} from "../../Types/MongoDB";

export type TServerState =
	| "NotInstalled"
	| "Offline"
	| "Online"
	| "ActionInProgress"
	| "Running";

export interface IInstanceState extends IMongoDB {
	State : TServerState;
	IsListen : boolean;
	Player : number;
	OnlinePlayerList : string[];
	ServerVersion : string;
	ArkmanagerPID : number;
	ArkserverPID : number;
}

export interface IInstanceData extends Record<string, any> {
	arkserverroot : string;
	arkserverexec : string;
	logdir : string;
	arkbackupdir : string;
	arkAutoUpdateOnStart : boolean;
	arkBackupPreUpdate : boolean;
	serverMapModId : number;
	ark_TotalConversionMod : number;
	arkbackupcompress : boolean;

	ark_RCONEnabled : boolean;
	serverMap : string;
	ark_RCONPort : number;
	ark_SessionName : string;
	arkStagingDir : string;
	arkStartDelay : number;
	ark_Port : number;
	ark_QueryPort : number;
	ark_ServerPassword : string;
	ark_ServerAdminPassword : string;
	ark_MaxPlayers : number;
	ark_GameModIds : number[];
	arkwarnminutes : number;
	Flags : Record<string, string>;
	Options : Record<string, string>;
	msgWarnUpdateMinutes : string;
	msgWarnUpdateSeconds : string;
	msgWarnRestartMinutes : string;
	msgWarnRestartSeconds : string;
	msgWarnShutdownMinutes : string;
	msgWarnShutdownSeconds : string;
	msgWarnCancelled : string;
	arkMaxBackupSizeMB : number;
	discordWebhookURL : string;
	notifyMsgShuttingDown : string;
	notifyMsgStarting : string;
	notifyMsgServerUp : string;
	notifyMsgStoppedListening : string;
	notifyMsgServerTerminated : string;
	notifyTemplate : string;
	noNotifyWarning : boolean;
	notifyCommand : string;
	chatCommandRestartCancel : string;
	arkNoPortDecrement : boolean;
	arkprecisewarn : boolean;
	arkautorestartfile : string;
	panel_publicip : string;
}


export interface IServerStatus {
	Online : boolean;
	Players : string[];
}

export interface IPanelServerConfig {
	BackupEnabled : boolean;
	MaxBackupfolderSize : number;
	BackupInterval : number;
	AutoUpdateParameters : string[];
	AutoUpdateEnabled : boolean;
	AutoUpdateInterval : number;
	_id? : string;
	__v? : number;
}

export interface IFullData {
	InstanceData : Record<string, TMO_Instance>;
}
