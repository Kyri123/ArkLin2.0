import { configManager } from "@/server/src/Lib/configManager.Lib";
import { ServerLib } from "@/server/src/Lib/server.Lib";
import { BC } from "@/server/src/Lib/system.Lib";
import MongoInstances from "@server/MongoDB/MongoInstances";
import fs from "fs";
import { JobTask } from "../taskManager";


export default new JobTask(
	configManager.getTaskConfig.DataCleanerInterval,
	"DataCleaner",
	async() => {
		// Clear old Sessions
		SystemLib.debugLog(
			"TASKS", " Running Task",
			BC( "Red" ),
			"DataCleaner"
		);

		// Clear old Instances
		for await ( const instance of MongoInstances.find() ) {
			const server = await ServerLib.build( instance.Instance );
			if( !server.isValid() || !fs.existsSync( server.instanceConfigFile ) ) {
				SystemLib.logWarning(
					"DB", "Cleanup old DB information (Not Exsisting):",
					instance.Instance
				);

				await MongoInstances.findOneAndDelete( { Instance: instance.Instance } );
				SocketIO.emit( "onServerRemoved" );
			}
		}
	}
);
