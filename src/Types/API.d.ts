import { TLTEColors } from "../Shared/Type/AdminLTE";

export interface IAPIRequestBase {
	LoginHash? : string;
}

export interface IAPIResponseBase<T = any> {
	Message? : IAPIResponseMessage;
	Success : boolean;
	Auth : boolean;
	Data? : T;
	Reached? : boolean;
}

export interface IAPIResponseMessage {
	Title : string;
	Message : string;
	AlertType : TLTEColors;
}