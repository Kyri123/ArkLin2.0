import type * as core                 from "express-serve-static-core";
import type {
	Request,
	Response
}                                     from "express-serve-static-core";
import { CreateUrl }                  from "@server/Lib/PathBuilder.Lib";
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
}                                     from "@app/Types/API_Response";
import {
	CreateServer,
	ServerLib
}                                     from "@server/Lib/Server.Lib";
import { EPerm }                      from "@shared/Enum/User.Enum";
import TaskManager                    from "../Tasks/TaskManager";
import { SSHManager }                 from "@server/Lib/ConfigManager.Lib";
import { EServerUrl }                 from "@shared/Enum/Routing";
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
}                                     from "@app/Types/API_Request";
import {
	DefaultResponseFailed,
	DefaultResponseSuccess
}                                     from "@shared/Default/ApiRequest.Default";
import { GetAllServerWithPermission } from "@server/Lib/User.Lib";
import type { Instance }              from "@server/MongoDB/DB_Instances";

export default function( Api : core.Express ) {
	let Url = CreateUrl( EServerUrl.getallserver );
	Api.get( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Server_Getallserver = {
			...DefaultResponseSuccess,
			Data: {}
		};

		const Request : TRequest_Server_Getallserver<true> = request.body;
		Response.Data = await GetAllServerWithPermission( Request.UserClass );

		response.json( Response );
	} );

	Url = CreateUrl( EServerUrl.getglobalstate );
	Api.get( Url, async( request : Request, response : Response ) => {
			const Response : TResponse_Server_Getglobalstate = {
				...DefaultResponseSuccess,
				Data: []
			};

			const Request : TRequest_Server_Getglobalstate<true> = request.body;
			if ( Request.UserClass.IsLoggedIn() ) {
				let [ Online, Offline, Total ] = [ 0, 0, 0 ];
				for ( const InstanceData of Object.values(
					await GetAllServerWithPermission( Request.UserClass ) as Record<string, Instance>
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
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Server_Setpanelconfig = {
			...DefaultResponseFailed
		};

		const Request : TRequest_Server_Setpanelconfig<true> = request.body;

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
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Server_Addserver = {
			...DefaultResponseFailed
		};

		const Request : TRequest_Server_Addserver<true> = request.body;
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
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Server_Removeserver = {
			...DefaultResponseFailed
		};

		const Request : TRequest_Server_Removeserver<true> = request.body;

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
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Server_Sendcommand = {
			...DefaultResponseFailed
		};

		const Request : TRequest_Server_Sendcommand<true> = request.body;

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
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Server_Cancelaction = {
			...DefaultResponseFailed
		};

		const Request : TRequest_Server_Cancelaction<true> = request.body;

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
	Api.post( Url, async( request : Request, response : Response ) => {
		const Response : TResponse_Server_Getlogs = {
			...DefaultResponseFailed,
			Data: ""
		};

		const Request : TRequest_Server_Getlogs<true> = request.body;

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
