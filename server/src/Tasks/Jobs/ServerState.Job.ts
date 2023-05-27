import { queryArkServer } from "@/server/src/Lib/arkServerQuery.Lib";
import {
	configManager,
	sshManager
} from "@/server/src/Lib/configManager.Lib";
import { ServerLib } from "@/server/src/Lib/server.Lib";
import { BC } from "@/server/src/Lib/system.Lib";
import type { InstanceState } from "@/src/Types/ArkSE";
import type { Instance } from "@server/MongoDB/MongoInstances";
import MongoInstances from "@server/MongoDB/MongoInstances";
import { EServerState } from "@shared/Enum/EServerState";
import fs from "fs";
import path from "path";
import { JobTaskCycle } from "../taskManager";


export default new JobTaskCycle<Instance>(
	"ServerState",

	async Self => {
		const emitData: Record<string, Instance> = {};
		for await ( const server of MongoInstances.find<Instance>() ) {
			const serverClass = await ServerLib.build( server.Instance );
			if( serverClass.isValid() ) {
				emitData[ server.Instance ] = serverClass.getWithCluster();
			}
		}
		Self.updateTickTime( configManager.getTaskConfig.ServerStateInterval / Math.max( Object.values( emitData ).length, 1 ) );
		SocketIO.emit( "onServerUpdated", emitData );
		return Object.values( emitData );
	},

	async( CallIndex, Server ) => {
		SystemLib.debugLog(
			"tasks", "Running Task ", CallIndex,
			BC( "Red" ),
			"ServerState"
		);

		if( !Server ) {
			return;
		}

		const serverL = await ServerLib.build( Server.Instance );
		if( serverL.isValid() ) {
			const instanceData = serverL.get.ArkmanagerCfg;
			const instanceName = serverL.instanceId;
			const instanceState: Partial<InstanceState> = {
				allConfigs: Object.keys( serverL.getConfigFiles() ).filter( e => e !== "Arkmanager.cfg" ),
				IsListen: false,
				State: EServerState.notInstalled,
				Player: 0,
				OnlinePlayerList: [],
				ServerVersion: "0.0",
				ArkmanagerPID: 0,
				ArkserverPID: 0
			};

			const versionFile = path.join(
				SERVERDIR,
				instanceName,
				"version.txt"
			);
			const serverExecFile = path.join(
				SERVERDIR,
				instanceName,
				instanceData.arkserverexec
			);
			const actionPIDFile = path.join(
				SERVERDIR,
				instanceName,
				`.${ instanceName }.panel.pid`
			);
			const arkServerPIDFile = path.join(
				SERVERDIR,
				instanceName,
				"ShooterGame/Saved",
				`.arkserver-${ instanceName }.pid`
			);

			const isInstalled = fs.existsSync( serverExecFile );

			if( fs.existsSync( actionPIDFile ) ) {
				instanceState.ArkmanagerPID = parseInt(
					fs.readFileSync( actionPIDFile ).toString()
				);
				if( instanceState.ArkmanagerPID !== 0 ) {
					try {
						const result = await sshManager.execCommand(
							`ps -fp ${ instanceState.ArkmanagerPID.toString() }`,
							{ encoding: "utf-8" }
						);
						if( result.code === 1 ) {
							instanceState.ArkmanagerPID = 0;
						}
					} catch( e ) {
						instanceState.ArkmanagerPID = 0;
					}
				}
			}

			if( isInstalled ) {
				instanceState.State = EServerState.offline;
				if( fs.existsSync( versionFile ) ) {
					instanceState.ServerVersion = fs
						.readFileSync( versionFile )
						.toString()
						.replaceAll( " ", "" )
						.trim();
				}

				if( fs.existsSync( arkServerPIDFile ) ) {
					instanceState.ArkserverPID = parseInt(
						fs.readFileSync( arkServerPIDFile ).toString()
					);
					if( instanceState.ArkserverPID !== 0 ) {
						try {
							const result = await sshManager.execCommand(
								`ps -fp ${ instanceState.ArkserverPID.toString() }`,
								{ encoding: "utf-8" }
							);
							if( result.code === 1 ) {
								instanceState.ArkserverPID = 0;
							}
						} catch( e ) {
							instanceState.ArkserverPID = 0;
						}
					}
				}

				if( instanceState.ArkserverPID !== 0 ) {
					const queryResult = await queryArkServer(
						serverL
					);
					instanceState.IsListen = queryResult.Online;
					instanceState.State = queryResult.Online
						? EServerState.online
						: EServerState.running;
					instanceState.Player = queryResult.Players.length;
					instanceState.OnlinePlayerList = queryResult.Players;
				}
			}

			if( instanceState.ArkmanagerPID !== 0 ) {
				instanceState.State = EServerState.actionInProgress;
			}

			const icon = `/img/maps/${ serverL.getConfig().serverMap }.jpg`;
			const background = `/img/backgrounds/${
				serverL.getConfig().serverMap
			}.jpg`;

			await serverL.setServerState( instanceState, {
				LOGO: fs.existsSync( path.join( BASEDIR, "public", icon ) )
					? icon
					: `/img/maps/TheIsland.jpg`,
				BG: fs.existsSync( path.join( BASEDIR, "public", background ) )
					? background
					: `/img/maps/TheIsland.jpg`
			} );
			serverL.emitUpdate();
		}
	}
);
