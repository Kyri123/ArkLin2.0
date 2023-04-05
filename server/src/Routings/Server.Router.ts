import * as core               from "express-serve-static-core";
import {
	Request,
	Response
}                              from "express-serve-static-core";
import {
	CreateUrl,
	MakeRandomID
}                              from "../Lib/PathBuilder.Lib";
import { IRequestBody }        from "../Types/Express";
import { IAPIResponseBase }    from "../../../src/Types/API";
import {
	IFullData,
	IPanelServerConfig
}                              from "../../../src/Shared/Type/ArkSE";
import {
	CreateServer,
	ServerLib
}                              from "../Lib/Server.Lib";
import { EPerm }               from "../../../src/Shared/Enum/User.Enum";
import TaskManager             from "../Tasks/TaskManager";
import { EArkmanagerCommands } from "../../../src/Lib/ServerUtils.Lib";
import { SSHManager }          from "../Lib/ConfigManager.Lib";
import { EServerUrl }          from "../../../src/Shared/Enum/Routing";

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
		const Response : IAPIResponseBase<IFullData> = {
			Auth: false,
			Success: true
		};

		const Request : IRequestBody = request.body;
		Response.Data = {
			InstanceData: await Request.UserClass.GetAllServerWithPermission()
		};

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
		const Response : IAPIResponseBase<number[]> = {
			Auth: false,
			Success: true
		};

		const Request : IRequestBody = request.body;
		let [ Online, Offline, Total ] = [ 0, 0, 0 ];
		for ( const InstanceData of Object.values(
			await Request.UserClass.GetAllServerWithPermission()
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
	} );

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
		const Response : IAPIResponseBase = {
			Auth: false,
			Success: false,
			Message: {
				AlertType: "danger",
				Message: `Fehler beim verarbeiten der Daten.`,
				Title: "Fehler!"
			}
		};

		const Request : IRequestBody<{
			ServerInstance? : string;
			Config? : Partial<IPanelServerConfig>;
		}> = request.body;

		if ( Request.ServerInstance && Request.Config ) {
			const Server = new ServerLib( Request.ServerInstance );
			if ( await Server.Init() ) {
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
		const Response : IAPIResponseBase = {
			Auth: false,
			Success: false,
			Message: {
				AlertType: "danger",
				Message: `Fehler beim verarbeiten der Daten.`,
				Title: "Fehler!"
			}
		};

		const Request : IRequestBody<{
			Config? : IPanelServerConfig;
		}> = request.body;
		const InstanceID = MakeRandomID( 20, true );

		if (
			Request.UserClass.HasPermission( EPerm.ManageServers ) &&
			Request.Config
		) {
			const Server = await CreateServer( Request.Config );
			if ( Server?.Init() ) {
				Response.Success = true;
				Response.Message = {
					AlertType: "success",
					Message: `Server ${ InstanceID } wurde erstellt.`,
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
		const Response : IAPIResponseBase = {
			Auth: false,
			Success: false,
			Message: {
				AlertType: "danger",
				Message: `Fehler beim verarbeiten der Daten.`,
				Title: "Fehler!"
			}
		};

		const Request : IRequestBody<{
			InstanceName? : string;
		}> = request.body;

		if (
			Request.UserClass.HasPermission( EPerm.ManageServers ) &&
			Request.InstanceName
		) {
			const Server = new ServerLib( Request.InstanceName );
			if ( await Server.Init() ) {
				await Server.RemoveServer();
				Response.Success = true;
				Response.Message = {
					AlertType: "success",
					Message: `Server ${ Request.InstanceName } wurde entfernt.`,
					Title: "Erfolgreich!"
				};
				setTimeout( () => {
					TaskManager.RunTask( "ServerState", true );
				}, 1000 );
				SocketIO.emit( "OnServerSettingsUpdated" );
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
		const Response : IAPIResponseBase = {
			Auth: false,
			Success: false,
			Message: {
				AlertType: "danger",
				Message: `Fehler beim verarbeiten der Daten.`,
				Title: "Fehler!"
			}
		};

		const Request : IRequestBody<{
			ServerInstance? : string;
			Command? : EArkmanagerCommands;
			Parameter? : string[];
		}> = request.body;

		if ( Request.Command && Request.ServerInstance && Request.Parameter ) {
			if (
				Request.UserClass.HasPermission( EPerm.ManageServers ) &&
				Request.UserClass.HasPermissionForServer( Request.ServerInstance )
			) {
				const Server = new ServerLib( Request.ServerInstance );
				if ( await Server.Init() ) {
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
		const Response : IAPIResponseBase = {
			Auth: false,
			Success: false,
			Message: {
				AlertType: "danger",
				Message: `Fehler beim verarbeiten der Daten.`,
				Title: "Fehler!"
			}
		};

		const Request : IRequestBody<{
			ServerInstance? : string;
		}> = request.body;

		if ( Request.ServerInstance ) {
			if ( Request.UserClass.HasPermissionForServer( Request.ServerInstance ) ) {
				const Server = new ServerLib( Request.ServerInstance );
				if ( await Server.Init() ) {
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
		const Response : IAPIResponseBase<Record<string, string> | string> = {
			Auth: false,
			Success: false
		};

		const Request : IRequestBody<{
			ServerInstance? : string;
			LogFile? : string;
		}> = request.body;

		if (
			Request.ServerInstance &&
			Request.UserClass.HasPermissionForServer( Request.ServerInstance )
		) {
			const Server = new ServerLib( Request.ServerInstance );
			if ( await Server.Init() ) {
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
		const Response : IAPIResponseBase<
			| Record<string, string>
			| {
			Obj : Record<string, any>;
			String : string;
		}
		> = {
			Auth: false,
			Success: false
		};

		const Request : IRequestBody<{
			ServerInstance? : string;
			LogFile? : string;
		}> = request.body;

		if (
			Request.ServerInstance &&
			Request.UserClass.HasPermissionForServer( Request.ServerInstance )
		) {
			const Server = new ServerLib( Request.ServerInstance );
			if ( await Server.Init() ) {
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
		const Response : IAPIResponseBase = {
			Auth: false,
			Success: false,
			Message: {
				AlertType: "danger",
				Message: `Fehler beim verarbeiten der Daten.`,
				Title: "Fehler!"
			}
		};

		const Request : IRequestBody<{
			ServerInstance : string;
			ConfigFile : string;
			ConfigContent : any;
		}> = request.body;

		if (
			Request.UserClass.HasPermission( EPerm.ManageServers ) &&
			Request.ServerInstance &&
			Request.ConfigFile &&
			typeof Request.ConfigContent === "object"
		) {
			const Server = new ServerLib( Request.ServerInstance );
			if ( await Server.Init() ) {
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

					SocketIO.emit( "OnServerUpdated", { [ Server.Instance ]: Server.Get! } );
				}
			}
		}

		response.json( Response );
	} );
}
