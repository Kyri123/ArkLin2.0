import type { LoaderFunction }      from "react-router-dom";
import { sendWithServerPermission } from "@page/app/loader/func/functions";
import { tRPC_Auth }                from "@app/Lib/tRPC";
import type { SteamMod }            from "@server/MongoDB/DB_SteamAPI_Mods";

export interface ServerModsLoaderProps {
	steamApiMods : SteamMod[];
}

const loader : LoaderFunction = async( { params } ) => {
	const query = await tRPC_Auth.server.api.getMods.query();
	const steamApiMods = query || [];

	return sendWithServerPermission<ServerModsLoaderProps>( {
		steamApiMods
	}, params );
};

export { loader };