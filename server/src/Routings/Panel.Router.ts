import * as core         from "express-serve-static-core";
import {
	Request,
	Response
}                        from "express-serve-static-core";
import { CreateUrl }     from "../Lib/PathBuilder.Lib";
import {
	TResponse_Panel_GetConfig,
	TResponse_Panel_Log,
	TResponse_Panel_Restart,
	TResponse_Panel_SetConfig
}                        from "../../../src/Shared/Type/API_Response";
import fs                from "fs";
import { EPerm }         from "../../../src/Shared/Enum/User.Enum";
import { ConfigManager } from "../Lib/ConfigManager.Lib";
import { EPanelUrl }     from "../../../src/Shared/Enum/Routing";
import {
	DefaultResponseFailed,
	DefaultResponseSuccess
}                        from "../Defaults/ApiRequest.Default";
import {
	TRequest_Panel_GetConfig,
	TRequest_Panel_Log,
	TRequest_Panel_Restart,
	TRequest_Panel_SetConfig
}                        from "../../../src/Shared/Type/API_Request";

export default function( Api : core.Express ) {
	let Url = CreateUrl( EPanelUrl.log );
	SystemLib.Log(
		"Install Router",
		SystemLib.ToBashColor( "Red" ),
		Url,
		SystemLib.ToBashColor( "Default" ),
		"| Mode:",
		SystemLib.ToBashColor( "Red" ),
		"GET"
	);
	Api.get( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Panel_Log = {
			...DefaultResponseSuccess,
			Data: []
		};

		const Request : TRequest_Panel_Log = request.body;
		if ( Request.UserClass.HasPermission( EPerm.PanelLog ) ) {
			if ( fs.existsSync( __LogFile ) ) {
				Response.Data = fs
					.readFileSync( __LogFile )
					.toString()
					.split( "\n" )
					.reverse();
			}
		}

		response.json( Response );
	} );

	Url = CreateUrl( EPanelUrl.restart );
	SystemLib.Log(
		"Install Router",
		SystemLib.ToBashColor( "Red" ),
		Url,
		SystemLib.ToBashColor( "Default" ),
		"| Mode:",
		SystemLib.ToBashColor( "Red" ),
		"POST"
	);
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Panel_Restart = {
			...DefaultResponseSuccess
		};

		const Request : TRequest_Panel_Restart = request.body;
		if ( Request.UserClass.HasPermission( EPerm.ManagePanel ) ) {
			SystemLib.LogWarning(
				"User Request:",
				SystemLib.ToBashColor( "Red" ),
				"RESTART"
			);
			process.exit( 0 );
		}

		response.json( Response );
	} );

	Url = CreateUrl( EPanelUrl.setconfig );
	SystemLib.Log(
		"Install Router",
		SystemLib.ToBashColor( "Red" ),
		Url,
		SystemLib.ToBashColor( "Default" ),
		"| Mode:",
		SystemLib.ToBashColor( "Red" ),
		"POST"
	);
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Panel_SetConfig = {
			...DefaultResponseFailed
		};

		const Request : TRequest_Panel_SetConfig = request.body;
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
	SystemLib.Log(
		"Install Router",
		SystemLib.ToBashColor( "Red" ),
		Url,
		SystemLib.ToBashColor( "Default" ),
		"| Mode:",
		SystemLib.ToBashColor( "Red" ),
		"GET"
	);
	Api.get( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Panel_GetConfig = {
			...DefaultResponseSuccess,
			Data: {}
		};

		const Request : TRequest_Panel_GetConfig = request.body;
		if (
			Request.UserClass.HasPermission( EPerm.PanelSettings ) &&
			Request.Config
		) {
			Response.Data = ConfigManager.Get( Request.Config );
		}

		response.json( Response );
	} );
}
