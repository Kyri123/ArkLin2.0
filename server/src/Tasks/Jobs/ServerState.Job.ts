import { JobTaskCycle }   from "../TaskManager";
import {
	ConfigManager,
	SSHManager
}                         from "../../Lib/ConfigManager.Lib";
import fs                 from "fs";
import path               from "path";
import { IInstanceState } from "../../../../src/Shared/Type/ArkSE";
import DB_Instances       from "../../MongoDB/DB_Instances";
import { ServerLib }      from "../../Lib/Server.Lib";
import { IMO_Instance }   from "../../../../src/Types/MongoDB";
import { QueryArkServer } from "../../Lib/ArkServerQuery.Lib";

export default new JobTaskCycle<IMO_Instance>(
	"ServerState",

	async( Self ) => {
		const EmitData : Record<string, IMO_Instance> = {};
		for await ( const Server of DB_Instances.find<IMO_Instance>() ) {
			EmitData[ Server.Instance ] = Server;
		}
		Self.UpdateTickTime( ConfigManager.GetTaskConfig.ServerStateInterval / Math.max( Object.values( EmitData ).length, 1 ) );
		SocketIO.emit( "OnServerUpdated", EmitData );
		return Object.values( EmitData );
	},

	async( CallIndex, Server ) => {
		SystemLib.DebugLog(
			"[TASKS] Running Task ", CallIndex,
			SystemLib.ToBashColor( "Red" ),
			"ServerState"
		);

		if ( !Server ) {
			return;
		}

		const ServerL = await ServerLib.build( Server.Instance );
		if ( ServerL.IsValid() ) {
			const InstanceData = ServerL.Get.ArkmanagerCfg;
			const InstanceName = ServerL.Instance;
			const InstanceState : Partial<IInstanceState> = {
				IsListen: false,
				State: "NotInstalled",
				Player: 0,
				OnlinePlayerList: [],
				ServerVersion: "0.0",
				ArkmanagerPID: 0,
				ArkserverPID: 0
			};

			const VersionFile = path.join(
				__server_dir,
				InstanceName,
				"version.txt"
			);
			const ServerExecFile = path.join(
				__server_dir,
				InstanceName,
				InstanceData.arkserverexec
			);
			const ActionPIDFile = path.join(
				__server_dir,
				InstanceName,
				`.${ InstanceName }.panel.pid`
			);
			const ArkServerPIDFile = path.join(
				__server_dir,
				InstanceName,
				"ShooterGame/Saved",
				`.arkserver-${ InstanceName }.pid`
			);

			const IsInstalled = fs.existsSync( ServerExecFile );

			if ( fs.existsSync( ActionPIDFile ) ) {
				InstanceState.ArkmanagerPID = parseInt(
					fs.readFileSync( ActionPIDFile ).toString()
				);
				if ( InstanceState.ArkmanagerPID !== 0 ) {
					try {
						const Result = await SSHManager.ExecCommand(
							`ps -fp ${ InstanceState.ArkmanagerPID.toString() }`,
							{ encoding: "utf-8" }
						);
						if ( Result.code === 1 ) {
							InstanceState.ArkmanagerPID = 0;
						}
					}
					catch ( e ) {
						InstanceState.ArkmanagerPID = 0;
					}
				}
			}

			if ( IsInstalled ) {
				InstanceState.State = "Offline";
				if ( fs.existsSync( VersionFile ) ) {
					InstanceState.ServerVersion = fs
						.readFileSync( VersionFile )
						.toString()
						.replaceAll( " ", "" )
						.trim();
				}

				if ( fs.existsSync( ArkServerPIDFile ) ) {
					InstanceState.ArkserverPID = parseInt(
						fs.readFileSync( ArkServerPIDFile ).toString()
					);
					if ( InstanceState.ArkserverPID !== 0 ) {
						try {
							const Result = await SSHManager.ExecCommand(
								`ps -fp ${ InstanceState.ArkserverPID.toString() }`,
								{ encoding: "utf-8" }
							);
							if ( Result.code === 1 ) {
								InstanceState.ArkserverPID = 0;
							}
						}
						catch ( e ) {
							InstanceState.ArkserverPID = 0;
						}
					}
				}

				if ( InstanceState.ArkserverPID !== 0 ) {
					const QueryResult = await QueryArkServer(
						ServerL
					);
					InstanceState.IsListen = QueryResult.Online;
					InstanceState.State = QueryResult.Online
						? "Online"
						: "Running";
					InstanceState.Player = QueryResult.Players.length;
					InstanceState.OnlinePlayerList = QueryResult.Players;
				}
			}

			if ( InstanceState.ArkmanagerPID !== 0 ) {
				InstanceState.State = "ActionInProgress";
			}

			const Icon = `/img/maps/${ ServerL.GetConfig().serverMap }.jpg`;
			const Background = `/img/backgrounds/${
				ServerL.GetConfig().serverMap
			}.jpg`;

			await ServerL.SetServerState( InstanceState, {
				LOGO: fs.existsSync( path.join( __basedir, "public", Icon ) )
					? Icon
					: `/img/maps/TheIsland.jpg`,
				BG: fs.existsSync( path.join( __basedir, "public", Background ) )
					? Background
					: `/img/maps/TheIsland.jpg`
			} );
		}
	}
);
