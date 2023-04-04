import {
	IInstanceData,
	IInstanceState,
	IPanelServerConfig
}                       from "../Type/ArkSE";
import { ISystemUsage } from "../Type/Systeminformation";

export interface IMongoDB {
	_id? : string;
	__v? : number;
}

export interface IMO_Accounts extends IMongoDB {
	username : string,
	password : string,
	mail : string,
	servers : string[],
	permissions? : string[]
}

export interface IMO_Instance extends IMongoDB {
	Instance : string;
	ArkmanagerCfg : IInstanceData,
	State : IInstanceState,
	PanelConfig : IPanelServerConfig,
	ServerMap : {
		LOGO : string,
		BG : string
	};
}

export type IMO_Usage = ISystemUsage & IMongoDB;