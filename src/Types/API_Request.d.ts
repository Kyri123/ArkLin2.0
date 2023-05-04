import type { PanelServerConfig }   from "./ArkSE";
import type { EArkmanagerCommands } from "../../Lib/ServerUtils.Lib";
import type {
	Cluster,
	UserAccount
}                                   from "../../Types/MongoDB";
import type User                    from "@app/Lib/User.Lib";

export type RequestWithUser<T = any> = {
	UserClass : T;
}

export interface IAPIRequestBase {
	LoginHash? : string;
}

export type IRequestBody<T = Record<string, any>, Y extends boolean = true, UserType = User> =
	Partial<T>
	& IAPIRequestBase
	& ( Y extends true ? RequestWithUser<UserType> : Partial<RequestWithUser<UserType>> );

export type TRequest_Unknown<UseUser extends boolean = true, UserType = User> = IRequestBody<unknown, UseUser, UserType>;

// ----------------------------------------
// ----------------- Auth -----------------
// ----------------------------------------

export type TRequest_Auth_SignIn<UseUser extends boolean = true, UserType = User> = IRequestBody<{
	login : string;
	password : string;
	stayloggedin? : boolean;
}, UseUser, UserType>;
export type TRequest_Auth_SignUp<UseUser extends boolean = true, UserType = User> = IRequestBody<{
	user : string;
	email : string;
	password : string;
	passwordagain : string;
	accountkey : string;
}, UseUser, UserType>;

// ----------------------------------------
// ------------- Changelog ----------------
// ----------------------------------------

export type TRequest_Changelog_GetChangelogs<UseUser extends boolean = true, UserType = User> = IRequestBody<any, UseUser, UserType>;
export type TRequest_Changelog_GetBranches<UseUser extends boolean = true, UserType = User> = IRequestBody<any, UseUser, UserType>;

// ----------------------------------------
// ----------------- Panel ----------------
// ----------------------------------------

export type TRequest_Panel_Log<UseUser extends boolean = true, UserType = User> = IRequestBody<any, UseUser, UserType>;
export type TRequest_Panel_Restart<UseUser extends boolean = true, UserType = User> = IRequestBody<any, UseUser, UserType>;
export type TRequest_Panel_SetConfig<UseUser extends boolean = true, UserType = User> = IRequestBody<{
	Config : string;
	Data : any;
}, UseUser, UserType>;
export type TRequest_Panel_GetConfig<UseUser extends boolean = true, UserType = User> = IRequestBody<{
	Config : string;
}, UseUser, UserType>;

// ----------------------------------------
// ---------------- Server ----------------
// ----------------------------------------

export type TRequest_Server_Getallserver<UseUser extends boolean = true, UserType = User> = IRequestBody<any, UseUser, UserType>;
export type TRequest_Server_Getconfigs<UseUser extends boolean = true, UserType = User> = IRequestBody<{
	ServerInstance : string;
	LogFile : string;
}, UseUser, UserType>;
export type TRequest_Server_Getlogs<UseUser extends boolean = true, UserType = User> = IRequestBody<{
	ServerInstance : string;
	LogFile : string;
}, UseUser, UserType>;
export type TRequest_Server_Cancelaction<UseUser extends boolean = true, UserType = User> = IRequestBody<{
	ServerInstance? : string;
}, UseUser, UserType>;
export type TRequest_Server_Sendcommand<UseUser extends boolean = true, UserType = User> = IRequestBody<{
	ServerInstance : string;
	Command : EArkmanagerCommands;
	Parameter : string[];
}, UseUser, UserType>;
export type TRequest_Server_Removeserver<UseUser extends boolean = true, UserType = User> = IRequestBody<{
	InstanceName : string;
}, UseUser, UserType>;
export type TRequest_Server_Addserver<UseUser extends boolean = true, UserType = User> = IRequestBody<{
	Config : PanelServerConfig;
}, UseUser, UserType>;
export type TRequest_Server_Setpanelconfig<UseUser extends boolean = true, UserType = User> = IRequestBody<{
	ServerInstance : string;
	Config : Partial<PanelServerConfig>;
}, UseUser, UserType>;
export type TRequest_Server_Setserverconfig<UseUser extends boolean = true, UserType = User> = IRequestBody<{
	ServerInstance : string;
	ConfigFile : string;
	ConfigContent : any;
}, UseUser, UserType>;
export type TRequest_Server_Getglobalstate<UseUser extends boolean = true, UserType = User> = IRequestBody<any, UseUser, UserType>;

// ------------------------------------------
// ---------------- SteamAPI ----------------
// ------------------------------------------

export type TRequest_SteamApi_Getmods<UseUser extends boolean = true, UserType = User> = IRequestBody<{
	modsIds : number[];
}, UseUser, UserType>;

// ----------------------------------------
// ---------------- System ----------------
// ----------------------------------------

export type TRequest_System_Getusage<UseUser extends boolean = true, UserType = User> = IRequestBody<any, UseUser, UserType>;

// ----------------------------------------
// ---------------- User ------------------
// ----------------------------------------

export type TRequest_User_Alluser<UseUser extends boolean = true, UserType = User> = IRequestBody<any, UseUser, UserType>;
export type TRequest_User_Allkeys<UseUser extends boolean = true, UserType = User> = IRequestBody<any, UseUser, UserType>;
export type TRequest_User_Getallowedservers<UseUser extends boolean = true, UserType = User> = IRequestBody<{
	Id : string;
}, UseUser, UserType>;
export type TRequest_User_Removeaccount<UseUser extends boolean = true, UserType = User> = IRequestBody<{
	Id : string;
}, UseUser, UserType>;
export type TRequest_User_Addkey<UseUser extends boolean = true, UserType = User> = IRequestBody<{
	rang : number;
}, UseUser, UserType>;
export type TRequest_User_Removekey<UseUser extends boolean = true, UserType = User> = IRequestBody<{
	Id? : string;
}, UseUser, UserType>;
export type TRequest_User_Edituser<UseUser extends boolean = true, UserType = User> = IRequestBody<{
	UserID : string;
	User : Partial<UserAccount>;
}, UseUser, UserType>;
export type TRequest_User_Usereditaccount<UseUser extends boolean = true, UserType = User> = IRequestBody<{
	UserData : UserAccount;
	Passwd : string[];
}, UseUser, UserType>;

// -----------------------------------------
// ---------------- Cluster ----------------
// -----------------------------------------

export type TRequest_Cluster_CreateCluster<UseUser extends boolean = true, UserType = User> = IRequestBody<{ Config : Cluster }, UseUser, UserType>;
export type TRequest_Cluster_GetClusters<UseUser extends boolean = true, UserType = User> = IRequestBody<unknown, UseUser, UserType>;
export type TRequest_Cluster_RemoveCluster<UseUser extends boolean = true, UserType = User> = IRequestBody<{ Id : string }, UseUser, UserType>;
export type TRequest_Cluster_SetCluster<UseUser extends boolean = true, UserType = User> = IRequestBody<{ Id : string, Config : Cluster }, UseUser, UserType>;
export type TRequest_Cluster_SendCommandToCluster<UseUser extends boolean = true, UserType = User> = IRequestBody<{ Id : string, Command : EArkmanagerCommands, Parameter : string[] }, UseUser, UserType>;