export interface ITaskConfig {
	"GithubQueryInterval" : number;
	"SystemInformationInterval" : number;
	"ServerStateInterval" : number;
	"DataCleanerInterval" : number;
	"SteamAPIQuery" : number;
}

export interface IDebugConfig {
	"UseDebug" : boolean;
	"FilterDebug" : string[];
}

export interface IDashboard_BaseConfig {
	"PANEL_Branch" : string;
	"LOG_MaxLogCount" : number;
	"SSH_Host" : string;
	"SSH_User" : string;
	"SSH_Password" : string;
	"Shell_ArkmanagerCommand" : string;
	"Shell_SteamCMDCommand" : string;
	"SteamApi_Key" : string;
}

export interface IAPI_BaseConfig {
	AccountHashExpire : number;
}