import { JobTaskCycle }       from "../TaskManager";
import {
	ConfigManager,
	SSHManager
}                             from "@server/Lib/ConfigManager.Lib";
import fs                     from "fs";
import path                   from "path";
import type { Instance }      from "@server/MongoDB/DB_Instances";
import DB_Instances           from "@server/MongoDB/DB_Instances";
import { ServerLib }          from "@server/Lib/Server.Lib";
import { QueryArkServer }     from "@server/Lib/ArkServerQuery.Lib";
import { BC }                 from "@server/Lib/System.Lib";
import { EServerState }       from "@shared/Enum/EServerState";
import type { InstanceState } from "@app/Types/ArkSE";

export default new JobTaskCycle<Instance>(
	"ServerState",

	async( Self ) => {
		const EmitData : Record<string, Instance> = {};
		for await ( const Server of DB_Instances.find<Instance>() ) {
			const ServerClass = await ServerLib.build( Server.Instance );
			if ( ServerClass.IsValid() ) {
				EmitData[ Server.Instance ] = ServerClass.GetWithCluster();
			}
		}
		Self.UpdateTickTime( ConfigManager.GetTaskConfig.ServerStateInterval / Math.max( Object.values( EmitData ).length, 1 ) );
		return Object.values( EmitData );
	},

	async( CallIndex, Server ) => {
		SystemLib.DebugLog(
			"tasks", "Running Task ", CallIndex,
			BC( "Red" ),
			"ServerState"
		);

		if ( !Server ) {
			return;
		}

		const ServerL = await ServerLib.build( Server.Instance );
		if ( ServerL.IsValid() ) {
			const InstanceData = ServerL.Get.ArkmanagerCfg;
			const InstanceName = ServerL.Instance;
			const InstanceState : Partial<InstanceState> = {
				allConfigs: Object.keys( ServerL.GetConfigFiles() ).filter( e => e !== "Arkmanager.cfg" ),
				IsListen: false,
				State: EServerState.notInstalled,
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
				InstanceState.State = EServerState.offline;
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
						? EServerState.online
						: EServerState.running;
					InstanceState.Player = QueryResult.Players.length;
					InstanceState.OnlinePlayerList = QueryResult.Players;
				}
			}

			if ( InstanceState.ArkmanagerPID !== 0 ) {
				InstanceState.State = EServerState.actionInProgress;
			}

			const Icon = `/img/maps/${ ServerL.GetConfig().serverMap }.jpg`;
			const Background = `/img/backgrounds/${
				ServerL.GetConfig().serverMap
			}.jpg`;

			await ServerL.SeEServerState( InstanceState, {
				LOGO: fs.existsSync( path.join( __basedir, "public", Icon ) )
					? Icon
					: `/img/maps/TheIsland.jpg`,
				BG: fs.existsSync( path.join( __basedir, "public", Background ) )
					? Background
					: `/img/maps/TheIsland.jpg`
			} );
			ServerL.EmitUpdate();
		}
	}
);
