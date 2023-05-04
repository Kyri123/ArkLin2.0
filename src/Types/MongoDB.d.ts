import type { ISystemUsage } from "../Shared/Type/Systeminformation";


export interface IMO_AccountKeys extends MongoBase {
	key : string;
	asSuperAdmin : boolean;
}

export interface MongoBase {
	_id : string;
	__v? : number;
	created_at : number;
	updated_at : number;
}

export interface IMO_Accounts extends MongoBase {
	username : string;
	password : string;
	mail : string;
	servers : string[];
	permissions? : string[];
}

export interface IMO_Cluster extends MongoBase {
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

type TMO_Instance = IMO_Instance & {
	Cluster? : IMO_Cluster | null | undefined;
}

export interface IMO_Instance extends MongoBase {
	Instance : string;
	ServerMap : {
		LOGO : string;
		BG : string;
	};
	LastAutoUpdate? : number;
	LastAutoBackup? : number;
}

export type IMO_Usage = ISystemUsage & MongoBase;
