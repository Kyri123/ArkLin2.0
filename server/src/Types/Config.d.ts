export interface TaskConfig {
	GithubQueryInterval: number,
	SystemInformationInterval: number,
	ServerStateInterval: number,
	DataCleanerInterval: number,
	SteamAPIQuery: number,
	ServerTasksInterval: number
}

export interface DebugConfig {
	UseDebug: boolean,
	FilterDebug: string[]
}

export interface DashboardBaseConfig {
	PANEL_Branch: string,
	PANEL_AutomaticUpdate: boolean,
	PANEL_UseCommitAsUpdateIndicator: boolean,
	PANEL_GithubToken: string,
	PANEL_ArkServerIp: string,
	LOG_MaxLogCount: number,
	SSH_Host: string,
	SSH_User: string,
	SSH_Password: string,
	Shell_ArkmanagerCommand: string,
	Shell_SteamCMDCommand: string,
	SteamApi_Key: string
}

export interface APIBaseConfig {
	AccountHashExpire: number
}
