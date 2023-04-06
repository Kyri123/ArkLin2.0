import {
	IInstanceData,
	IInstanceState,
	IPanelServerConfig
}                       from "../Type/ArkSE";
import { ISystemUsage } from "../Type/Systeminformation";

export interface IMongoDB {
	_id? : string;
	__v? : number;
	created_at? : number;
	updated_at? : number;
}

export interface IMO_Accounts extends IMongoDB {
	username : string;
	password : string;
	mail : string;
	servers : string[];
	permissions? : string[];
}

export interface IMO_Cluster extends IMongoDB {
	Instances : string[];
	SyncInis : string[];
	SyncSettings : string[];
	DisplayName : string;
	Master : string;
	NoTransferFromFiltering : boolean;
	NoTributeDownloads : boolean;
	PreventDownloadSurvivors : boolean;
	PreventUploadSurvivors : boolean;
	PreventDownloadItems : boolean;
	PreventUploadItems : boolean;
	PreventDownloadDinos : boolean;
	PreventUploadDinos : boolean;

}

export interface IMO_Instance extends IMongoDB {
	Instance : string;
	ArkmanagerCfg : IInstanceData;
	State : IInstanceState;
	PanelConfig : IPanelServerConfig;
	ServerMap : {
		LOGO : string;
		BG : string;
	};
	LastAutoUpdate? : number;
	LastAutoBackup? : number;
}

export type IMO_Usage = ISystemUsage & IMongoDB;
