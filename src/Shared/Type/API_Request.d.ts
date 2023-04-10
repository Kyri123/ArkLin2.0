import { IPanelServerConfig }  from "./ArkSE";
import { EArkmanagerCommands } from "../../Lib/ServerUtils.Lib";
import {
	IMO_Accounts,
	IMO_Cluster
}                              from "../../Types/MongoDB";

export type RequestWithUser<T = any> = {
	UserClass : T;
}

export interface IAPIRequestBase {
	LoginHash? : string;
}

export type IRequestBody<T = Record<string, any>, Y extends boolean = true, UserType = any> =
	Partial<T>
	& IAPIRequestBase
	& ( Y extends true ? RequestWithUser<UserType> : Partial<RequestWithUser<UserType>> );

export type TRequest_Unknown<UseUser extends boolean = true, UserType = any> = IRequestBody<unknown, UseUser, UserType>;

// ----------------------------------------
// ----------------- Auth -----------------
// ----------------------------------------

export type TRequest_Auth_SignIn<UseUser extends boolean = true, UserType = any> = IRequestBody<{
	login : string;
	password : string;
	stayloggedin? : boolean;
}, UseUser, UserType>;
export type TRequest_Auth_SignUp<UseUser extends boolean = true, UserType = any> = IRequestBody<{
	user : string;
	email : string;
	password : string;
	passwordagain : string;
	accountkey : string;
}, UseUser, UserType>;

// ----------------------------------------
// ------------- Changelog ----------------
// ----------------------------------------

export type TRequest_Changelog_GetChangelogs<UseUser extends boolean = true, UserType = any> = IRequestBody<any, UseUser, UserType>;
export type TRequest_Changelog_GetBranches<UseUser extends boolean = true, UserType = any> = IRequestBody<any, UseUser, UserType>;

// ----------------------------------------
// ----------------- Panel ----------------
// ----------------------------------------

export type TRequest_Panel_Log<UseUser extends boolean = true, UserType = any> = IRequestBody<any, UseUser, UserType>;
export type TRequest_Panel_Restart<UseUser extends boolean = true, UserType = any> = IRequestBody<any, UseUser, UserType>;
export type TRequest_Panel_SetConfig<UseUser extends boolean = true, UserType = any> = IRequestBody<{
	Config : string;
	Data : any;
}, UseUser, UserType>;
export type TRequest_Panel_GetConfig<UseUser extends boolean = true, UserType = any> = IRequestBody<{
	Config : string;
}, UseUser, UserType>;

// ----------------------------------------
// ---------------- Server ----------------
// ----------------------------------------

export type TRequest_Server_Getallserver<UseUser extends boolean = true, UserType = any> = IRequestBody<any, UseUser, UserType>;
export type TRequest_Server_Getconfigs<UseUser extends boolean = true, UserType = any> = IRequestBody<{
	ServerInstance : string;
	LogFile : string;
}, UseUser, UserType>;
export type TRequest_Server_Getlogs<UseUser extends boolean = true, UserType = any> = IRequestBody<{
	ServerInstance : string;
	LogFile : string;
}, UseUser, UserType>;
export type TRequest_Server_Cancelaction<UseUser extends boolean = true, UserType = any> = IRequestBody<{
	ServerInstance? : string;
}, UseUser, UserType>;
export type TRequest_Server_Sendcommand<UseUser extends boolean = true, UserType = any> = IRequestBody<{
	ServerInstance : string;
	Command : EArkmanagerCommands;
	Parameter : string[];
}, UseUser, UserType>;
export type TRequest_Server_Removeserver<UseUser extends boolean = true, UserType = any> = IRequestBody<{
	InstanceName : string;
}, UseUser, UserType>;
export type TRequest_Server_Addserver<UseUser extends boolean = true, UserType = any> = IRequestBody<{
	Config : IPanelServerConfig;
}, UseUser, UserType>;
export type TRequest_Server_Setpanelconfig<UseUser extends boolean = true, UserType = any> = IRequestBody<{
	ServerInstance : string;
	Config : Partial<IPanelServerConfig>;
}, UseUser, UserType>;
export type TRequest_Server_Setserverconfig<UseUser extends boolean = true, UserType = any> = IRequestBody<{
	ServerInstance : string;
	ConfigFile : string;
	ConfigContent : any;
}, UseUser, UserType>;
export type TRequest_Server_Getglobalstate<UseUser extends boolean = true, UserType = any> = IRequestBody<any, UseUser, UserType>;

// ------------------------------------------
// ---------------- SteamAPI ----------------
// ------------------------------------------

export type TRequest_SteamApi_Getmods<UseUser extends boolean = true, UserType = any> = IRequestBody<{
	modsIds : number[];
}, UseUser, UserType>;

// ----------------------------------------
// ---------------- System ----------------
// ----------------------------------------

export type TRequest_System_Getusage<UseUser extends boolean = true, UserType = any> = IRequestBody<any, UseUser, UserType>;

// ----------------------------------------
// ---------------- User ------------------
// ----------------------------------------

export type TRequest_User_Alluser<UseUser extends boolean = true, UserType = any> = IRequestBody<any, UseUser, UserType>;
export type TRequest_User_Allkeys<UseUser extends boolean = true, UserType = any> = IRequestBody<any, UseUser, UserType>;
export type TRequest_User_Getallowedservers<UseUser extends boolean = true, UserType = any> = IRequestBody<{
	Id : string;
}, UseUser, UserType>;
export type TRequest_User_Removeaccount<UseUser extends boolean = true, UserType = any> = IRequestBody<{
	Id : string;
}, UseUser, UserType>;
export type TRequest_User_Addkey<UseUser extends boolean = true, UserType = any> = IRequestBody<{
	rang : number;
}, UseUser, UserType>;
export type TRequest_User_Removekey<UseUser extends boolean = true, UserType = any> = IRequestBody<{
	Id? : string;
}, UseUser, UserType>;
export type TRequest_User_Edituser<UseUser extends boolean = true, UserType = any> = IRequestBody<{
	UserID : string;
	User : Partial<IMO_Accounts>;
}, UseUser, UserType>;
export type TRequest_User_Usereditaccount<UseUser extends boolean = true, UserType = any> = IRequestBody<{
	UserData : IMO_Accounts;
	Passwd : string[];
}, UseUser, UserType>;

// -----------------------------------------
// ---------------- Cluster ----------------
// -----------------------------------------

export type TRequest_Cluster_AllServerWithoutCluster<UseUser extends boolean = true, UserType = any> = IRequestBody<unknown, UseUser, UserType>;
export type TRequest_Cluster_CreateCluster<UseUser extends boolean = true, UserType = any> = IRequestBody<{ Config : IMO_Cluster }, UseUser, UserType>;
export type TRequest_Cluster_GetClusters<UseUser extends boolean = true, UserType = any> = IRequestBody<unknown, UseUser, UserType>;
export type TRequest_Cluster_RemoveCluster<UseUser extends boolean = true, UserType = any> = IRequestBody<{ Id : string }, UseUser, UserType>;
export type TRequest_Cluster_SetCluster<UseUser extends boolean = true, UserType = any> = IRequestBody<{ Id : string, Config : IMO_Cluster }, UseUser, UserType>;
export type TRequest_Cluster_SendCommandToCluster<UseUser extends boolean = true, UserType = any> = IRequestBody<{ Id : string, Command : EArkmanagerCommands, Parameter : string[] }, UseUser, UserType>;