import type {
	NextFunction,
	Request,
	Response
}                                from "express";
import type { TPermissions }     from "@shared/Enum/User.Enum";
import type { TRequest_Unknown } from "@app/Types/API_Request";
import { DefaultResponseFailed } from "@shared/Default/ApiRequest.Default";

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

	const Req : TRequest_Unknown<true> = req.body;

	if ( Req.UserClass.IsLoggedIn() && Req.UserClass.HasPermission( Permission ) ) {
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
