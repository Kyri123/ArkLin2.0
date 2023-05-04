import { API_QueryLib } from "./API_Query.Lib";
import type {
	TResponse_Auth_IsLoggedIn,
	TResponse_Auth_SignIn,
	TResponse_Auth_SignUp
}                       from "@shared/Type/API_Response";
import { EAuthUrl }     from "@shared/Enum/Routing";
import type {
	TRequest_Auth_SignIn,
	TRequest_Auth_SignUp
}                       from "@shared/Type/API_Request";

export class API_AuthLib {
	static async IsLoggedIn() : Promise<TResponse_Auth_IsLoggedIn> {
		return await API_QueryLib.PostToAPI<TResponse_Auth_IsLoggedIn>(
			EAuthUrl.check,
			{}
		);
	}

	static async TryCreateAnAccount(
		RequestData : TRequest_Auth_SignUp<false>
	) : Promise<TResponse_Auth_SignUp> {
		return await API_QueryLib.PostToAPI<TResponse_Auth_SignUp>(
			EAuthUrl.signup,
			RequestData
		);
	}

	static async DoLogin(
		RequestData : TRequest_Auth_SignIn<false>
	) : Promise<TResponse_Auth_SignIn> {
		return await API_QueryLib.PostToAPI<TResponse_Auth_SignIn>(
			EAuthUrl.signin,
			RequestData
		);
	}
}
