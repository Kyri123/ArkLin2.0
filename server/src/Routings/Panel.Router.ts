import type * as core    from "express-serve-static-core";
import type {
	Request,
	Response
}                        from "express-serve-static-core";
import { CreateUrl }     from "@server/Lib/PathBuilder.Lib";
import type {
	TResponse_Panel_GetConfig,
	TResponse_Panel_Restart,
	TResponse_Panel_SetConfig
}                        from "@app/Types/API_Response";
import { EPerm }         from "@shared/Enum/User.Enum";
import { ConfigManager } from "@server/Lib/ConfigManager.Lib";
import { EPanelUrl }     from "@shared/Enum/Routing";
import {
	DefaultResponseFailed,
	DefaultResponseSuccess
}                        from "@shared/Default/ApiRequest.Default";
import type {
	TRequest_Panel_GetConfig,
	TRequest_Panel_Restart,
	TRequest_Panel_SetConfig
}                        from "@app/Types/API_Request";

export default function( Api : core.Express ) {
	let Url = CreateUrl( EPanelUrl.restart );
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Panel_Restart = {
			...DefaultResponseSuccess
		};

		const Request : TRequest_Panel_Restart<true> = request.body;
		if ( Request.UserClass.HasPermission( EPerm.ManagePanel ) ) {
			SystemLib.LogWarning( "system",
				"User Request:",
				SystemLib.ToBashColor( "Red" ),
				"RESTART"
			);
			process.exit( 0 );
		}

		response.json( Response );
	} );

	Url = CreateUrl( EPanelUrl.setconfig );
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Panel_SetConfig = {
			...DefaultResponseFailed
		};

		const Request : TRequest_Panel_SetConfig<true> = request.body;
		if (
			Request.UserClass.HasPermission( EPerm.PanelSettings ) &&
			Request.Config &&
			Request.Data
		) {
			if ( ConfigManager.Write( Request.Config, Request.Data ) ) {
				Response.Success = true;
				Response.Message = {
					AlertType: "success",
					Message: `Konfiguration wurde bearbeitet. Bitte starte das Panel neu um die Änderungen zu Übernehmen.`,
					Title: "Gespeichert"
				};
			}
		}

		response.json( Response );
	} );

	Url = CreateUrl( EPanelUrl.getconfig );
	Api.get( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Panel_GetConfig = {
			...DefaultResponseSuccess,
			Data: {}
		};

		const Request : TRequest_Panel_GetConfig<true> = request.body;
		if (
			Request.UserClass.HasPermission( EPerm.PanelSettings ) &&
			Request.Config
		) {
			Response.Data = ConfigManager.Get( Request.Config );
		}

		response.json( Response );
	} );
}
