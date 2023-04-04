import { UserLib } from "../Lib/User.Lib";

export type IRequestBody<T = Record<string, any>> = T & {
	UserClass : UserLib;
}