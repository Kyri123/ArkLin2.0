import { UserLib }             from "../../../server/src/Lib/User.Lib";
import { IPanelServerConfig }  from "./ArkSE";
import { EArkmanagerCommands } from "../../Lib/ServerUtils.Lib";
import { IMO_Accounts }        from "../Api/MongoDB";

export type RequestWithUser = {
	UserClass : UserLib<true>;
}

export interface IAPIRequestBase {
	LoginHash? : string;
}

export type IRequestBody<T = Record<string, any>, Y extends boolean = true> = Partial<T> & IAPIRequestBase & Y extends true ? RequestWithUser : Partial<RequestWithUser>;


// ----------------------------------------
// ----------------- Auth -----------------
// ----------------------------------------

export type TRequest_Auth_SignIn<UseUser extends boolean> = IRequestBody<{
	login : string;
	password : string;
	stayloggedin? : boolean;
}, UseUser>;
export type TRequest_Auth_SignUp<UseUser extends boolean> = IRequestBody<{
	user : string;
	email : string;
	password : string;
	passwordagain : string;
	accountkey : string;
}, UseUser>;

// ----------------------------------------
// ------------- Changelog ----------------
// ----------------------------------------

export type TRequest_Changelog_GetChangelogs<UseUser extends boolean> = IRequestBody<undefined, UseUser>;
export type TRequest_Changelog_GetBranches<UseUser extends boolean> = IRequestBody<undefined, UseUser>;

// ----------------------------------------
// ----------------- Panel ----------------
// ----------------------------------------

export type TRequest_Panel_Log<UseUser extends boolean> = IRequestBody<undefined, UseUser>;
export type TRequest_Panel_Restart<UseUser extends boolean> = IRequestBody<undefined, UseUser>;
export type TRequest_Panel_SetConfig<UseUser extends boolean> = IRequestBody<{
	Config : string;
	Data : any;
}, UseUser>;
export type TRequest_Panel_GetConfig<UseUser extends boolean> = IRequestBody<{
	Config : string;
}, UseUser>;

// ----------------------------------------
// ---------------- Server ----------------
// ----------------------------------------

export type TRequest_Server_Getallserver<UseUser extends boolean> = IRequestBody<undefined, UseUser>;
export type TRequest_Server_Getconfigs<UseUser extends boolean> = IRequestBody<{
	ServerInstance : string;
	LogFile : string;
}, UseUser>;
export type TRequest_Server_Getlogs<UseUser extends boolean> = IRequestBody<{
	ServerInstance : string;
	LogFile : string;
}, UseUser>;
export type TRequest_Server_Cancelaction<UseUser extends boolean> = IRequestBody<{
	ServerInstance? : string;
}, UseUser>;
export type TRequest_Server_Sendcommand<UseUser extends boolean> = IRequestBody<{
	ServerInstance : string;
	Command : EArkmanagerCommands;
	Parameter : string[];
}, UseUser>;
export type TRequest_Server_Removeserver<UseUser extends boolean> = IRequestBody<{
	InstanceName : string;
}, UseUser>;
export type TRequest_Server_Addserver<UseUser extends boolean> = IRequestBody<{
	Config : IPanelServerConfig;
}, UseUser>;
export type TRequest_Server_Setpanelconfig<UseUser extends boolean> = IRequestBody<{
	ServerInstance : string;
	Config : Partial<IPanelServerConfig>;
}, UseUser>;
export type TRequest_Server_Setserverconfig<UseUser extends boolean> = IRequestBody<{
	ServerInstance : string;
	ConfigFile : string;
	ConfigContent : any;
}, UseUser>;
export type TRequest_Server_Getglobalstate<UseUser extends boolean> = IRequestBody<undefined, UseUser>;

// ------------------------------------------
// ---------------- SteamAPI ----------------
// ------------------------------------------

export type TRequest_SteamApi_Getmods<UseUser extends boolean> = IRequestBody<{
	modsIds : number[];
}, UseUser>;

// ----------------------------------------
// ---------------- System ----------------
// ----------------------------------------

export type TRequest_System_Getusage<UseUser extends boolean> = IRequestBody<undefined, UseUser>;

// ----------------------------------------
// ---------------- User ------------------
// ----------------------------------------

export type TRequest_User_Alluser<UseUser extends boolean> = IRequestBody<undefined, UseUser>;
export type TRequest_User_Allkeys<UseUser extends boolean> = IRequestBody<undefined, UseUser>;
export type TRequest_User_Getallowedservers<UseUser extends boolean> = IRequestBody<{
	Id : string;
}, UseUser>;
export type TRequest_User_Removeaccount<UseUser extends boolean> = IRequestBody<{
	Id : string;
}, UseUser>;
export type TRequest_User_Addkey<UseUser extends boolean> = IRequestBody<{
	rang : number;
}, UseUser>;
export type TRequest_User_Removekey<UseUser extends boolean> = IRequestBody<{
	Id? : string;
}, UseUser>;
export type TRequest_User_Edituser<UseUser extends boolean> = IRequestBody<{
	UserID : string;
	User : Partial<IMO_Accounts>;
}, UseUser>;
export type TRequest_User_Usereditaccount<UseUser extends boolean> = IRequestBody<{
	UserData : IMO_Accounts;
	Passwd : string[];
}, UseUser>;