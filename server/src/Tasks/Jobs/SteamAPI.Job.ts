import { JobTask }       from "../TaskManager";
import { ConfigManager } from "../../Lib/ConfigManager.Lib";
import {
	GetAllModIds,
	QuerySteamAPI
}                        from "../../Lib/SteamApi.Lib";
import DB_SteamAPI_Mods  from "../../MongoDB/DB_SteamAPI_Mods";
import type { ISteamApiMod }  from "../../../../src/Types/SteamAPI";

export default new JobTask(
	ConfigManager.GetTaskConfig.DataCleanerInterval,
	"SteamAPI",
	async() => {
		// Clear old Sessions
		SystemLib.DebugLog(
			"[TASKS] Running Task",
			SystemLib.ToBashColor( "Red" ),
			"SteamAPI"
		);

		// Do Query Steam API Mods
		const ModsIds = await GetAllModIds();

		try {
			const Response = await QuerySteamAPI(
				"/ISteamRemoteStorage/GetPublishedFileDetails/v1",
				{
					itemcount: ModsIds.length,
					publishedfileids: ModsIds
				}
			);

			const ResultObject = JSON.parse( Response );
			for ( const ModResult of ResultObject.response
				.publishedfiledetails as ISteamApiMod[] ) {
				await DB_SteamAPI_Mods.findOneAndReplace(
					{ publishedfileid: ModResult.publishedfileid },
					ModResult,
					{ upsert: true }
				);
			}

			SystemLib.Log(
				`[SteamAPI] Updated Mods from API ( Total: ${ ResultObject.response.publishedfiledetails.length } )`
			);
			SocketIO.emit( "SteamApiUpdated" );
		}
		catch ( e ) {
		}
	}
);
