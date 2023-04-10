export enum EAuthUrl {
	check = "auth/check",
	signup = "auth/signup",
	signin = "auth/signin",
}

export enum EChangelogUrl {
	get = "changelog/get",
	branches = "changelog/branches",
}

export enum EPanelUrl {
	log = "panel/log",
	update = "panel/update",
	restart = "panel/restart",
	setconfig = "panel/setconfig",
	getconfig = "panel/getconfig",
}

export enum ESysUrl {
	usage = "system/usage",
}

export enum EServerUrl {
	getconfigs = "server/getconfigs",
	getlogs = "server/getlogs",
	cancelaction = "server/cancelaction",
	sendcommand = "server/sendcommand",
	removeserver = "server/removeserver",
	addserver = "server/addserver",
	setpanelconfig = "server/setpanelconfig",
	setserverconfig = "server/setserverconfig",
	getglobalstate = "server/getglobalstate",
	getallserver = "server/getallserver",
}

export enum EUserUrl {
	alluser = "user/alluser",
	allkeys = "user/allkeys",
	getallowedservers = "user/getallowedservers",
	removeaccount = "user/removeaccount",
	addkey = "user/addkey",
	removekey = "user/removekey",
	edituser = "user/edituser",
	usereditaccount = "user/usereditaccount",
}

export enum ESteamApiUrl {
	getmods = "steamapi/getmods",
}

export enum EClusterApiUrl {
	getclusters = "cluster/getclusters",
	setcluster = "cluster/setcluster",
	createcluster = "cluster/createcluster",
	removecluster = "cluster/removecluster",
	sendcommandtocluster = "cluster/sendcommandtocluster",
}

export type TServerUrls =
	| EAuthUrl
	| EChangelogUrl
	| EPanelUrl
	| ESysUrl
	| EServerUrl
	| EUserUrl
	| ESteamApiUrl
	| EClusterApiUrl
	| "";
