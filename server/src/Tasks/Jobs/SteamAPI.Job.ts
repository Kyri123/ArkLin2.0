import { configManager } from "@/server/src/Lib/configManager.Lib";
import {
	getAllModIds,
	querySteamAPI
} from "@/server/src/Lib/steamApi.Lib";
import { BC } from "@/server/src/Lib/system.Lib";
import type { SteamMod } from "@server/MongoDB/MongoSteamAPIMods";
import MongoSteamAPIMods from "@server/MongoDB/MongoSteamAPIMods";
import { JobTask } from "../taskManager";


export default new JobTask(
	configManager.getTaskConfig.SteamAPIQuery,
	"SteamAPI",
	async() => {
		// Clear old Sessions
		SystemLib.debugLog( "tasks",
			" Running Task",
			BC( "Red" ),
			"SteamAPI"
		);

		// Do Query Steam API Mods
		const modsIds = await getAllModIds();

		try {
			const response = await querySteamAPI(
				"/ISteamRemoteStorage/GetPublishedFileDetails/v1",
				{
					itemcount: modsIds.length,
					publishedfileids: modsIds
				}
			);

			const resultObject = JSON.parse( response );
			for( const modResult of resultObject.response
				.publishedfiledetails as SteamMod[] ) {
				await MongoSteamAPIMods.findOneAndReplace(
					{ publishedfileid: modResult.publishedfileid },
					modResult,
					{ upsert: true }
				);
			}

			SystemLib.log(
				`SteamAPI`, ` Updated Mods from API ( Total: ${ resultObject.response.publishedfiledetails.length } )`
			);
			SocketIO.emit( "onSteamApiUpdated" );
		} catch( e ) {
		}
	}
);
