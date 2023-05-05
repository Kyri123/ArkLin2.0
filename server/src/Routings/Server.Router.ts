import type * as core            from "express-serve-static-core";
import type {
	Request,
	Response
}                                from "express-serve-static-core";
import { CreateUrl }             from "@server/Lib/PathBuilder.Lib";
import type {
	TResponse_Server_Getconfigs,
	TResponse_Server_Setserverconfig
}                                from "@app/Types/API_Response";
import { ServerLib }             from "@server/Lib/Server.Lib";
import { EPerm }                 from "@shared/Enum/User.Enum";
import { EServerUrl }            from "@shared/Enum/Routing";
import type {
	TRequest_Server_Getconfigs,
	TRequest_Server_Setserverconfig
}                                from "@app/Types/API_Request";
import { DefaultResponseFailed } from "@shared/Default/ApiRequest.Default";

export default function( Api : core.Express ) {
	let Url = CreateUrl( EServerUrl.getconfigs );
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Server_Getconfigs = {
			...DefaultResponseFailed,
			Data: {}
		};

		const Request : TRequest_Server_Getconfigs<true> = request.body;

		if (
			Request.ServerInstance &&
			Request.UserClass.HasPermissionForServer( Request.ServerInstance )
		) {
			const Server = await ServerLib.build( Request.ServerInstance );
			if ( Server.IsValid() ) {
				Response.Success = true;
				if ( Request.LogFile ) {
					Response.Data = {
						Obj: Server.GetConfigContent( Request.LogFile ),
						String: Server.GetConfigContentRaw( Request.LogFile )
					};
				}
				else {
					Response.Data = Server.GetConfigFiles();
				}
			}
		}

		response.json( Response );
	} );

	Url = CreateUrl( EServerUrl.setserverconfig );
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Server_Setserverconfig = {
			...DefaultResponseFailed
		};

		const Request : TRequest_Server_Setserverconfig<true> = request.body;

		if (
			Request.UserClass.HasPermission( EPerm.ManageServers ) &&
			Request.ServerInstance &&
			Request.ConfigFile &&
			typeof Request.ConfigContent === "object"
		) {
			const Server = await ServerLib.build( Request.ServerInstance );
			if ( Server.IsValid() ) {
				if (
					await Server.SetServerConfig(
						Request.ConfigFile,
						Request.ConfigContent
					)
				) {
					Response.Success = true;
					Response.Message = {
						AlertType: "success",
						Message: `Konfiguration ${ Request.ConfigFile } wurde gespeichert.`,
						Title: "Erfolgreich!"
					};

					Server.EmitUpdate();
				}
			}
		}

		response.json( Response );
	} );
}
