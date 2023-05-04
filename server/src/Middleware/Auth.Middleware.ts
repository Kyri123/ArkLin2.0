import type {
	NextFunction,
	Request,
	Response
}                                from "express";
import type { TPermissions }          from "../../../src/Shared/Enum/User.Enum";
import type { TRequest_Unknown }      from "../../../src/Shared/Type/API_Request";
import type { UserLib }               from "../Lib/User.Lib";
import { DefaultResponseFailed } from "../../../src/Shared/Default/ApiRequest.Default";

export type TMiddlewares = any & {
	req : Request,
	res : Response,
	next : NextFunction
}

export function AuthMiddleware( Permission : TPermissions | undefined, Args : TMiddlewares, DefaultData : any = undefined ) {
	const { req, res, next } = Args;
	if ( !Permission ) {
		next();
		return;
	}

	const Req : TRequest_Unknown<true, UserLib> = req.body;

	if ( Req.UserClass.IsValid() && Req.UserClass.HasPermission( Permission ) ) {
		next();
		return;
	}

	res.json( {
		...DefaultResponseFailed,
		Data: DefaultData,
		Message: {
			AlertType: "danger",
			Message: `Es fehlt die Berechtigung dies zu tun...`,
			Title: "Keine Berechtigung!"
		}
	} );
	return;
}
