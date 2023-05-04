import type { Instance }  from "@server/MongoDB/DB_Instances";
import type { MongoBase } from "@app/Types/MongoDB";

export type InstanceState = Instance[ "State" ] & Partial<MongoBase>

export interface InstanceData extends Record<string, any> {
	arkserverroot : string;
	arkserverexec : string;
	logdir : string;
	arkbackupdir : string;
	arkAutoUpdateOnStart : boolean;
	arkBackupPreUpdate : boolean;
	serverMapModId : string;
	ark_TotalConversionMod : string;
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

export interface ServerStatus {
	Online : boolean;
	Players : string[];
}

export type PanelServerConfig = Instance[ "PanelConfig" ] & Partial<MongoBase>