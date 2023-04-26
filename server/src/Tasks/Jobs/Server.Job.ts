import fs                              from "fs";
import path                            from "path";
import { EArkmanagerCommands }         from "../../../../src/Lib/ServerUtils.Lib";
import { GetDefaultPanelServerConfig } from "../../../../src/Shared/Default/Server.Default";
import { IInstanceData }               from "../../../../src/Shared/Type/ArkSE";
import {
	ConfigToJSON,
	FillWithDefaultValues
}                                      from "../../Lib/Arkmanager.Lib";
import { ConfigManager }               from "../../Lib/ConfigManager.Lib";
import { ToRealDir }                   from "../../Lib/PathBuilder.Lib";
import {
	CreateServer,
	ServerLib
}                                      from "../../Lib/Server.Lib";
import DB_Instances                    from "../../MongoDB/DB_Instances";
import { JobTask }                     from "../TaskManager";

export default new JobTask(
	ConfigManager.GetTaskConfig.ServerTasksInterval,
	"Server",
	async() => {
		SystemLib.DebugLog(
			"[TASKS] Running Task",
			SystemLib.ToBashColor( "Red" ),
			"Server"
		);

		// Read and save all Instances
		const InstancesFolder = path.join( __server_arkmanager, "instances" );
		const ServerData : Record<string, IInstanceData> = {};
		for ( const Instance of fs.readdirSync( InstancesFolder ) ) {
			if ( Instance.endsWith( ".cfg" ) ) {
				const Server = Instance.replace( ".cfg", "" );
				const FilePath = path.join(
					__server_arkmanager,
					"instances",
					`${ Instance }`
				);
				const ConfigContent = fs.readFileSync( FilePath ).toString();
				const InstanceData = ConfigToJSON( ConfigContent );
				ServerData[ Server ] = FillWithDefaultValues( Server, InstanceData );

				ServerData[ Server ].Instance = Server;
				if ( ( await DB_Instances.exists( { Instance: Server } ) ) !== null ) {
					const ServerL = await ServerLib.build( Server );
					if ( ServerL.IsValid() ) {
						await ServerL.SetServerConfig( "arkmanager.cfg", ServerData[ Server ] );
					}
				}
				else {
					await CreateServer( GetDefaultPanelServerConfig(), Server );
				}
			}
		}

		for await ( const ServerData of DB_Instances.find() ) {
			const Server = await ServerLib.build( ServerData.Instance );
			if ( Server.IsValid() ) {
				const Cfg = Server.Get!;
				const PanelConfig = Cfg.PanelConfig;

				if ( PanelConfig.AutoUpdateEnabled && ( ( Cfg.LastAutoUpdate || 0 ) + PanelConfig.AutoUpdateInterval ) <= Date.now() && Cfg.State.State !== "ActionInProgress" ) {
					await Server.ExecuteCommand( EArkmanagerCommands.update, PanelConfig.AutoUpdateParameters );
					await Server.Update( {
						LastAutoUpdate: Date.now()
					} );
				}

				if ( PanelConfig.BackupEnabled && ( ( Cfg.LastAutoBackup || 0 ) + PanelConfig.BackupInterval ) <= Date.now() && Cfg.State.State !== "ActionInProgress" ) {
					await Server.ExecuteCommand( EArkmanagerCommands.backup );
					await Server.Update( {
						LastAutoBackup: Date.now()
					} );
				}
			}

			if ( Server.IsInCluster() ) {
				const Cluster = Server.GetCluster;
				if ( Cluster ) {
					const CurrentConfig = Server.GetConfig();

					CurrentConfig[ "NoTransferFromFiltering" ] = Cluster.NoTransferFromFiltering;
					CurrentConfig[ "NoTributeDownloads" ] = Cluster.NoTributeDownloads;
					CurrentConfig[ "PreventDownloadDinos" ] = Cluster.PreventDownloadDinos;
					CurrentConfig[ "PreventDownloadItems" ] = Cluster.PreventDownloadItems;
					CurrentConfig[ "PreventDownloadSurvivors" ] = Cluster.PreventDownloadSurvivors;
					CurrentConfig[ "PreventUploadDinos" ] = Cluster.PreventUploadDinos;
					CurrentConfig[ "PreventUploadSurvivors" ] = Cluster.PreventUploadSurvivors;
					CurrentConfig[ "PreventUploadItems" ] = Cluster.PreventUploadItems;
					CurrentConfig.Options[ "clusterid" ] = Cluster._id!;
					CurrentConfig.Options[ "ClusterDirOverride" ] = ToRealDir( __cluster_dir );

					await Server.SetServerConfig( "arkmanager.cfg", CurrentConfig );
				}
			}
			else {
				const CurrentConfig = ( Server as ServerLib<true> ).GetConfig();

				delete CurrentConfig[ "NoTransferFromFiltering" ];
				delete CurrentConfig[ "NoTributeDownloads" ];
				delete CurrentConfig[ "PreventDownloadDinos" ];
				delete CurrentConfig[ "PreventDownloadItems" ];
				delete CurrentConfig[ "PreventDownloadSurvivors" ];
				delete CurrentConfig[ "PreventUploadDinos" ];
				delete CurrentConfig[ "PreventUploadSurvivors" ];
				delete CurrentConfig[ "PreventUploadItems" ];
				delete CurrentConfig.Options[ "clusterid" ];
				delete CurrentConfig.Options[ "ClusterDirOverride" ];

				await ( Server as ServerLib<true> ).SetServerConfig( "arkmanager.cfg", CurrentConfig );
				continue;
			}


			if ( !Server.IsMaster && Server.IsInCluster() ) {
				const Cluster = Server.GetCluster;
				const Master = await Server.GetClusterMaster();
				if ( Master && Cluster ) {
					for ( const [ Filename, Path ] of Object.entries( Master.GetConfigFiles() ) ) {
						if ( Cluster.SyncSettings.includes( Filename ) && Filename.toLowerCase() !== "arkmanager.cfg" ) {
							const MasterContent = Master.GetConfigContentRaw( Path );
							Server.SetServerConfigRaw( Filename, MasterContent );
						}
					}

					const CurrentConfig = Server.GetConfig();
					const CurrentMasterConfig = Master.GetConfig();
					for ( const Setting of Cluster.SyncInis ) {
						if ( CurrentMasterConfig[ Setting ] ) {
							CurrentConfig[ Setting ] = CurrentMasterConfig[ Setting ];
						}
						else if ( CurrentConfig[ Setting ] ) {
							delete CurrentConfig[ Setting ];
						}
					}

					await Server.SetServerConfig( "arkmanager.cfg", CurrentConfig );
					Server.EmitUpdate();
				}
			}
		}
	}
);
