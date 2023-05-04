import type * as core        from "express-serve-static-core";
import type {
	Request,
	Response
}                       from "express-serve-static-core";
import { CreateUrl }    from "../Lib/PathBuilder.Lib";
import type {
	TResponse_Server_Addserver,
	TResponse_Server_Cancelaction,
	TResponse_Server_Getallserver,
	TResponse_Server_Getconfigs,
	TResponse_Server_Getglobalstate,
	TResponse_Server_Getlogs,
	TResponse_Server_Removeserver,
	TResponse_Server_Sendcommand,
	TResponse_Server_Setpanelconfig,
	TResponse_Server_Setserverconfig
}                       from "../../../src/Shared/Type/API_Response";
import {
	CreateServer,
	ServerLib
}                       from "../Lib/Server.Lib";
import { EPerm }        from "../../../src/Shared/Enum/User.Enum";
import TaskManager      from "../Tasks/TaskManager";
import { SSHManager }   from "../Lib/ConfigManager.Lib";
import { EServerUrl }   from "../../../src/Shared/Enum/Routing";
import type {
	TRequest_Server_Addserver,
	TRequest_Server_Cancelaction,
	TRequest_Server_Getallserver,
	TRequest_Server_Getconfigs,
	TRequest_Server_Getglobalstate,
	TRequest_Server_Getlogs,
	TRequest_Server_Removeserver,
	TRequest_Server_Sendcommand,
	TRequest_Server_Setpanelconfig,
	TRequest_Server_Setserverconfig
}                       from "../../../src/Shared/Type/API_Request";
import {
	DefaultResponseFailed,
	DefaultResponseSuccess
}                       from "../../../src/Shared/Default/ApiRequest.Default";
import type { TMO_Instance } from "../../../src/Types/MongoDB";
import type { UserLib }      from "../Lib/User.Lib";

export default function( Api : core.Express ) {
	let Url = CreateUrl( EServerUrl.getallserver );
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
		const Response : TResponse_Server_Getallserver = {
			...DefaultResponseSuccess,
			Data: {}
		};

		const Request : TRequest_Server_Getallserver<true, UserLib<true>> = request.body;
		Response.Data = await Request.UserClass.GetAllServerWithPermission();

		response.json( Response );
	} );

	Url = CreateUrl( EServerUrl.getglobalstate );
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
			const Response : TResponse_Server_Getglobalstate = {
				...DefaultResponseSuccess,
				Data: []
			};

			const Request : TRequest_Server_Getglobalstate<true, UserLib<true>> = request.body;
			if ( Request.UserClass.IsValid() ) {
				let [ Online, Offline, Total ] = [ 0, 0, 0 ];
				for ( const InstanceData of Object.values(
					await Request.UserClass.GetAllServerWithPermission() as Record<string, TMO_Instance>
				) ) {
					Total++;
					if ( InstanceData.State.IsListen ) {
						Online++;
						continue;
					}
					Offline++;
				}
				Response.Data = [ Online, Offline, Total ];

				response.json( Response );
			}
		}
	);

	Url = CreateUrl( EServerUrl.setpanelconfig );
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
		const Response : TResponse_Server_Setpanelconfig = {
			...DefaultResponseFailed
		};

		const Request : TRequest_Server_Setpanelconfig<true, UserLib<true>> = request.body;

		if ( Request.ServerInstance && Request.Config && Request.UserClass.HasPermissionForServer( Request.ServerInstance ) ) {
			const Server = await ServerLib.build( Request.ServerInstance );
			if ( Server.IsValid() ) {
				if ( await Server.SetPanelConfig( Request.Config ) ) {
					Response.Success = true;
					Response.Message = {
						AlertType: "success",
						Message: `Instance Config wurde gespeichert.`,
						Title: "Erfolgreich!"
					};
					Server.EmitUpdate();
				}
			}
		}

		response.json( Response );
	} );

	Url = CreateUrl( EServerUrl.addserver );
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
		const Response : TResponse_Server_Addserver = {
			...DefaultResponseFailed
		};

		const Request : TRequest_Server_Addserver<true, UserLib<true>> = request.body;
		if ( Request.Config && Request.UserClass.HasPermission( EPerm.ManageServers ) ) {
			const Server = await CreateServer( Request.Config );
			if ( Server ) {
				Response.Success = true;
				Response.Message = {
					AlertType: "success",
					Message: `Server ${ Server.Instance } wurde erstellt.`,
					Title: "Erfolgreich!"
				};
				await TaskManager.RunTask( "ServerState", true );
				Server.EmitUpdate();
			}
		}

		response.json( Response );
	} );

	Url = CreateUrl( EServerUrl.removeserver );
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
		const Response : TResponse_Server_Removeserver = {
			...DefaultResponseFailed
		};

		const Request : TRequest_Server_Removeserver<true, UserLib<true>> = request.body;

		if (
			Request.UserClass.HasPermission( EPerm.ManageServers ) &&
			Request.InstanceName
		) {
			const Server = await ServerLib.build( Request.InstanceName );
			if ( Server.IsValid() ) {
				await Server.RemoveServer();
				Response.Success = true;
				Response.Message = {
					AlertType: "success",
					Message: `Server ${ Request.InstanceName } wurde entfernt.`,
					Title: "Erfolgreich!"
				};
			}
		}

		response.json( Response );
	} );

	Url = CreateUrl( EServerUrl.sendcommand );
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
		const Response : TResponse_Server_Sendcommand = {
			...DefaultResponseFailed
		};

		const Request : TRequest_Server_Sendcommand<true, UserLib<true>> = request.body;

		if ( Request.Command && Request.ServerInstance && Request.Parameter ) {
			if (
				Request.UserClass.HasPermission( EPerm.ManageServers ) &&
				Request.UserClass.HasPermissionForServer( Request.ServerInstance )
			) {
				const Server = await ServerLib.build( Request.ServerInstance );
				if ( Server.IsValid() ) {
					Response.Success = await Server.ExecuteCommand(
						Request.Command,
						Request.Parameter
					);
					Response.Message = {
						AlertType: "success",
						Message: `Befehlt wurde an den Server gesendet.`,
						Title: "Erfolgreich!"
					};
					await TaskManager.RunTask( "ServerState", true );
				}
			}
			else {
				Response.Message = {
					AlertType: "danger",
					Message: `Keine Berechtigung dies zu tun`,
					Title: "Fehler!"
				};
			}
		}

		response.json( Response );
	} );

	Url = CreateUrl( EServerUrl.cancelaction );
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
		const Response : TResponse_Server_Cancelaction = {
			...DefaultResponseFailed
		};

		const Request : TRequest_Server_Cancelaction<true, UserLib<true>> = request.body;

		if ( Request.ServerInstance ) {
			if ( Request.UserClass.HasPermissionForServer( Request.ServerInstance ) ) {
				const Server = await ServerLib.build( Request.ServerInstance );
				if ( Server.IsValid() ) {
					const State = await Server.GetState();
					if ( State.ArkmanagerPID > 0 ) {
						await SSHManager.Exec( "kill", [ State.ArkmanagerPID.toString() ] );
						await TaskManager.RunTask( "ServerState", true );
						Response.Success = true;
						Response.Message = {
							AlertType: "success",
							Message: `Befehlt wurde an den Server gesendet.`,
							Title: "Erfolgreich!"
						};
					}
				}
			}
			else {
				Response.Message = {
					AlertType: "danger",
					Message: `Keine Berechtigung dies zu tun`,
					Title: "Fehler!"
				};
			}
		}

		response.json( Response );
	} );

	Url = CreateUrl( EServerUrl.getlogs );
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
		const Response : TResponse_Server_Getlogs = {
			...DefaultResponseFailed,
			Data: ""
		};

		const Request : TRequest_Server_Getlogs<true, UserLib<true>> = request.body;

		if (
			Request.ServerInstance &&
			Request.UserClass.HasPermissionForServer( Request.ServerInstance )
		) {
			const Server = await ServerLib.build( Request.ServerInstance );
			if ( Server.IsValid() ) {
				if ( Request.LogFile ) {
					Response.Data = Server.GetLogContent( Request.LogFile );
				}
				else {
					Response.Data = Server.GetLogFiles();
				}
			}
		}

		response.json( Response );
	} );

	Url = CreateUrl( EServerUrl.getconfigs );
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
		const Response : TResponse_Server_Getconfigs = {
			...DefaultResponseFailed,
			Data: {}
		};

		const Request : TRequest_Server_Getconfigs<true, UserLib<true>> = request.body;

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
		const Response : TResponse_Server_Setserverconfig = {
			...DefaultResponseFailed
		};

		const Request : TRequest_Server_Setserverconfig<true, UserLib<true>> = request.body;

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
