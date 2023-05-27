import { apiAuth } from "@app/Lib/tRPC";
import { sendWithServerPermission } from "@page/app/loader/func/functions";
import type { SteamMod } from "@server/MongoDB/MongoSteamAPIMods";
import type { LoaderFunction } from "react-router-dom";


export interface ServerModsLoaderProps {
	steamApiMods: SteamMod[]
}

const loader: LoaderFunction = async( { params } ) => {
	const query = await apiAuth.server.api.getMods.query();
	const steamApiMods = query || [];

	return sendWithServerPermission<ServerModsLoaderProps>( {
		steamApiMods
	}, params );
};

export { loader };

