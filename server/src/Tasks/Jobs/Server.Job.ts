import { JobTask }             from "../TaskManager";
import { ConfigManager }       from "../../Lib/ConfigManager.Lib";
import DB_Instances            from "../../MongoDB/DB_Instances";
import { ServerLib }           from "../../Lib/Server.Lib";
import { EArkmanagerCommands } from "../../../../src/Lib/ServerUtils.Lib";

export default new JobTask(
	ConfigManager.GetTaskConfig.ServerTasksInterval,
	"Server",
	async() => {
		SystemLib.DebugLog(
			"[TASKS] Running Task",
			SystemLib.ToBashColor( "Red" ),
			"Server"
		);

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

			if ( !Server.IsMaster && Server.IsInCluster() ) {
				const Cluster = Server.GetCluster;
				const Master = await Server.GetClusterMaster();
				if ( Master && Cluster ) {
					for ( const [ Filename, Path ] of Object.entries( Master.GetConfigFiles() ) ) {
						if ( Cluster.SyncSettings.includes( Filename ) && Filename.toLowerCase() !== "arkmanager.cfg" ) {
							const MasterContent = Master.GetConfigContent( Filename );
							await Server.SetServerConfig( Path, MasterContent );
						}
					}
				}
			}
		}
	}
);
