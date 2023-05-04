import { JobTask }       from "../TaskManager";
import { ConfigManager } from "@server/Lib/ConfigManager.Lib";
import type { Instance } from "@server/MongoDB/DB_Instances";
import DB_Instances      from "@server/MongoDB/DB_Instances";
import { ServerLib }     from "@server/Lib/Server.Lib";
import fs                from "fs";
import { BC }            from "@server/Lib/System.Lib";

export default new JobTask(
	ConfigManager.GetTaskConfig.DataCleanerInterval,
	"DataCleaner",
	async() => {
		// Clear old Sessions
		SystemLib.DebugLog(
			"TASKS", " Running Task",
			BC( "Red" ),
			"DataCleaner"
		);

		// Clear old Instances
		for await ( const Instance of DB_Instances.find() ) {
			const Data : Instance = Instance.toJSON();
			const Server = await ServerLib.build( Data.Instance );
			if ( !Server.IsValid() || !fs.existsSync( Server.InstanceConfigFile ) ) {
				SystemLib.LogWarning(
					"DB", "Cleanup old DB information (Not Exsisting):",
					Data.Instance
				);

				await DB_Instances.findOneAndDelete( { Instance: Data.Instance } );
				SocketIO.emit( "OnServerRemoved" );
			}
		}
	}
);
