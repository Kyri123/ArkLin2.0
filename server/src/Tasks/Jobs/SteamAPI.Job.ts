import { JobTask }                    from "../TaskManager";
import { ConfigManager }              from "@server/Lib/ConfigManager.Lib";
import {
	GetAllModIds,
	QuerySteamAPI
}                                     from "@server/Lib/SteamApi.Lib";
import type { SteamMod } from "@server/MongoDB/DB_SteamAPI_Mods";
import DB_SteamAPI_Mods from "@server/MongoDB/DB_SteamAPI_Mods";
import { BC }                         from "@server/Lib/System.Lib";

export default new JobTask(
	ConfigManager.GetTaskConfig.SteamAPIQuery,
	"SteamAPI",
	async() => {
		// Clear old Sessions
		SystemLib.DebugLog( "tasks",
			" Running Task",
			BC( "Red" ),
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
				.publishedfiledetails as SteamMod[] ) {
				await DB_SteamAPI_Mods.findOneAndReplace(
					{ publishedfileid: ModResult.publishedfileid },
					ModResult,
					{ upsert: true }
				);
			}

			SystemLib.Log(
				`SteamAPI`, ` Updated Mods from API ( Total: ${ ResultObject.response.publishedfiledetails.length } )`
			);
			SocketIO.emit( "SteamApiUpdated" );
		}
		catch ( e ) {
		}
	}
);
