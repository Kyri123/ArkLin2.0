import { JobTask }       from "../TaskManager";
import { ConfigManager } from "../../Lib/ConfigManager.Lib";
import { IMO_Instance }  from "../../../../src/Types/MongoDB";
import DB_Instances      from "../../MongoDB/DB_Instances";
import { ServerLib }     from "../../Lib/Server.Lib";
import fs                from "fs";

export default new JobTask(
	ConfigManager.GetTaskConfig.DataCleanerInterval,
	"DataCleaner",
	async() => {
		// Clear old Sessions
		SystemLib.DebugLog(
			"[TASKS] Running Task",
			SystemLib.ToBashColor( "Red" ),
			"DataCleaner"
		);

		// Clear old Instances
		for await ( const Instance of DB_Instances.find() ) {
			const Data : IMO_Instance = Instance.toJSON();
			const Server = await ServerLib.build( Data.Instance );
			if ( !Server.IsValid() || !fs.existsSync( Server.InstanceConfigFile ) ) {
				SystemLib.LogWarning(
					"[DB] Cleanup old DB information (Not Exsisting):",
					Data.Instance
				);

				await DB_Instances.findOneAndDelete( { Instance: Data.Instance } );
				SocketIO.emit( "OnServerRemoved" );
			}
		}
	}
);
