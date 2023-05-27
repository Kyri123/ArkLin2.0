import {
	configToJSON,
	fillWithDefaultValues
} from "@/server/src/Lib/arkmanager.Lib";
import { configManager } from "@/server/src/Lib/configManager.Lib";
import { toRealDir } from "@/server/src/Lib/pathBuilder.Lib";
import {
	ServerLib,
	createServer
} from "@/server/src/Lib/server.Lib";
import { BC } from "@/server/src/Lib/system.Lib";
import { EArkmanagerCommands } from "@app/Lib/serverUtils";
import type { InstanceData } from "@app/Types/ArkSE";
import MongoInstances from "@server/MongoDB/MongoInstances";
import { getDefaultPanelServerConfig } from "@shared/Default/Server.Default";
import { EServerState } from "@shared/Enum/EServerState";
import fs from "fs";
import path from "path";
import { JobTask } from "../taskManager";


export default new JobTask(
	configManager.getTaskConfig.ServerTasksInterval,
	"Server",
	async() => {
		SystemLib.debugLog(
			"TASKS", "Running Task",
			BC( "Red" ),
			"Server"
		);

		// Read and save all Instances
		const instancesFolder = path.join( SERVERARKMANAGER, "instances" );
		const serverData: Record<string, InstanceData> = {};
		for( const instance of fs.readdirSync( instancesFolder ) ) {
			if( instance.endsWith( ".cfg" ) ) {
				const server = instance.replace( ".cfg", "" );
				const filePath = path.join(
					SERVERARKMANAGER,
					"instances",
					`${ instance }`
				);
				const configContent = fs.readFileSync( filePath ).toString();
				const instanceData = configToJSON( configContent );
				serverData[ server ] = fillWithDefaultValues( server, instanceData );

				serverData[ server ].Instance = server;
				if( ( await MongoInstances.exists( { Instance: server } ) ) !== null ) {
					const serverL = await ServerLib.build( server );
					if( serverL.isValid() ) {
						await serverL.setServerConfig( "arkmanager.cfg", serverData[ server ] );
					}
				} else {
					await createServer( getDefaultPanelServerConfig(), server );
				}
			}
		}

		for await ( const serverData of MongoInstances.find() ) {
			const server = await ServerLib.build( serverData.Instance );
			if( server.isValid() ) {
				const cfg = server.get!;
				const panelConfig = cfg.PanelConfig;

				if( panelConfig.AutoUpdateEnabled && ( ( cfg.LastAutoUpdate || 0 ) + panelConfig.AutoUpdateInterval ) <= Date.now() && cfg.State.State !== EServerState.actionInProgress ) {
					await server.executeCommand( EArkmanagerCommands.update, panelConfig.AutoUpdateParameters );
					await server.update( {
						LastAutoUpdate: Date.now()
					} );
				}

				if( panelConfig.BackupEnabled && ( ( cfg.LastAutoBackup || 0 ) + panelConfig.BackupInterval ) <= Date.now() && cfg.State.State !== EServerState.actionInProgress ) {
					await server.executeCommand( EArkmanagerCommands.backup );
					await server.update( {
						LastAutoBackup: Date.now()
					} );
				}
			}

			if( server.isInCluster() ) {
				const cluster = server.getCluster;
				if( cluster ) {
					const currentConfig = server.getConfig();

					currentConfig[ "NoTransferFromFiltering" ] = cluster.NoTransferFromFiltering;
					currentConfig[ "NoTributeDownloads" ] = cluster.NoTributeDownloads;
					currentConfig[ "PreventDownloadDinos" ] = cluster.PreventDownloadDinos;
					currentConfig[ "PreventDownloadItems" ] = cluster.PreventDownloadItems;
					currentConfig[ "PreventDownloadSurvivors" ] = cluster.PreventDownloadSurvivors;
					currentConfig[ "PreventUploadDinos" ] = cluster.PreventUploadDinos;
					currentConfig[ "PreventUploadSurvivors" ] = cluster.PreventUploadSurvivors;
					currentConfig[ "PreventUploadItems" ] = cluster.PreventUploadItems;
					currentConfig.Options[ "clusterid" ] = cluster._id!;
					currentConfig.Options[ "ClusterDirOverride" ] = toRealDir( CLUSTERDIR );

					await server.setServerConfig( "arkmanager.cfg", currentConfig );
				}
			} else {
				const currentConfig = server.getConfig();

				delete currentConfig[ "NoTransferFromFiltering" ];
				delete currentConfig[ "NoTributeDownloads" ];
				delete currentConfig[ "PreventDownloadDinos" ];
				delete currentConfig[ "PreventDownloadItems" ];
				delete currentConfig[ "PreventDownloadSurvivors" ];
				delete currentConfig[ "PreventUploadDinos" ];
				delete currentConfig[ "PreventUploadSurvivors" ];
				delete currentConfig[ "PreventUploadItems" ];
				delete currentConfig.Options[ "clusterid" ];
				delete currentConfig.Options[ "ClusterDirOverride" ];

				await server.setServerConfig( "arkmanager.cfg", currentConfig );
				continue;
			}


			if( !server.isMaster && server.isInCluster() ) {
				const cluster = server.getCluster;
				const master = await server.getClusterMaster();
				if( master && cluster ) {
					for( const [ filename, path ] of Object.entries( master.getConfigFiles() ) ) {
						if( cluster.SyncSettings.includes( filename ) && filename.toLowerCase() !== "arkmanager.cfg" ) {
							const masterContent = master.getConfigContentRaw( path );
							SystemLib.debugLog( "clustersync", "Sync Config:", filename, `(${ master.instanceId } ---> ${ server.instanceId })` );
							server.setServerConfigRaw( filename, masterContent );
						}
					}

					const currentConfig = server.getConfig();
					const currentMasterConfig = master.getConfig();
					for( const setting of cluster.SyncInis ) {
						if( currentMasterConfig[ setting ] ) {
							currentConfig[ setting ] = currentMasterConfig[ setting ];
						} else if( currentConfig[ setting ] ) {
							delete currentConfig[ setting ];
						}
					}

					await server.setServerConfig( "arkmanager.cfg", currentConfig );
					server.emitUpdate();
				}
			}
		}
	}
);
