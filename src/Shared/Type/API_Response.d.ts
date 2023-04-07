/** @format */
import { TLTEColors }           from "./AdminLTE";
import { IAccountInformations } from "./User";
import {
	IGithubBranche,
	IGithubReleases
}                               from "../Api/github";
import { ISteamApiMod }         from "../Api/SteamAPI";
import { TMO_Instance }         from "../Api/MongoDB";
import { ISystemUsage }         from "./Systeminformation";

export type ResponseWithMessage = {
	Message : IAPIResponseMessage;
}

export type IAPIResponseBase<MessageOpt extends boolean = false, T = any> = {
	Success : boolean;
	Auth : boolean;
	Data : T;
	Reached? : boolean;
} & MessageOpt extends false ? ResponseWithMessage : Partial<ResponseWithMessage>;

export interface IAPIResponseMessage {
	Title : string;
	Message : string;
	AlertType : TLTEColors;
}

//export type TResponse_X_X = IAPIResponseBase<>;

export type TResponse_AnyData<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt, any>;
export type TResponse_Boolean<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt, boolean>;

// ----------------------------------------
// ----------------- Auth -----------------
// ----------------------------------------

export type TResponse_Auth_SignUp<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt, IAccountInformations>;
export type TResponse_Auth_SignIn<MessageOpt extends boolean = false> = TResponse_Auth_SignUp<MessageOpt>;
export type TResponse_Auth_IsLoggedIn<MessageOpt extends boolean = false> = TResponse_Auth_SignIn<MessageOpt>;

// ----------------------------------------
// ------------- Changelog ----------------
// ----------------------------------------

export type TResponse_Changelog_GetChangelogs<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt, IGithubReleases[]>;
export type TResponse_Changelog_GetBranches<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt, IGithubBranche[]>;

// ----------------------------------------
// ----------------- Panel ----------------
// ----------------------------------------

export type TResponse_Panel_Log<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt, string[]>;
export type TResponse_Panel_Restart<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt>;
export type TResponse_Panel_SetConfig<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt>;
export type TResponse_Panel_GetConfig<MessageOpt extends boolean = false> = TResponse_AnyData<MessageOpt>;

// ----------------------------------------
// ---------------- Server ----------------
// ----------------------------------------

export type TResponse_Server_Getconfigs<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt, Record<string, string> | {
	Obj : Record<string, any>;
	String : string;
}>;
export type TResponse_Server_Getlogs<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt, Record<string, string> | string>;
export type TResponse_Server_Cancelaction<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt>;
export type TResponse_Server_Sendcommand<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt>;
export type TResponse_Server_Removeserver<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt>;
export type TResponse_Server_Addserver<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt>;
export type TResponse_Server_Setpanelconfig<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt>;
export type TResponse_Server_Setserverconfig<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt>;
export type TResponse_Server_Getglobalstate<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt, number[]>;
export type TResponse_Server_Getallserver<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt, Record<string, TMO_Instance>>;

// ------------------------------------------
// ---------------- SteamAPI ----------------
// ------------------------------------------

export type TResponse_SteamApi_Getmods<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt, Record<number, ISteamApiMod>>;

// ----------------------------------------
// ---------------- System ----------------
// ----------------------------------------

export type TResponse_System_Getusage<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt, ISystemUsage>;

// ----------------------------------------
// ---------------- User ------------------
// ----------------------------------------

export type TResponse_User_Alluser<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt>;
export type TResponse_User_Allkeys<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt>;
export type TResponse_User_Getallowedservers<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt, Record<string, TMO_Instance>>;
export type TResponse_User_Removeaccount<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt>;
export type TResponse_User_Addkey<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt>;
export type TResponse_User_Removekey<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt>;
export type TResponse_User_Edituser<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt>;
export type TResponse_User_Usereditaccount<MessageOpt extends boolean = false> = IAPIResponseBase<MessageOpt>;