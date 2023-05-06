import type { LoaderFunction } from "react-router-dom";
import { tRPC_Public }         from "@app/Lib/tRPC";
import type { GithubBranch }   from "@server/MongoDB/DB_GithubBranches";
import { sendWithPermission }  from "@page/app/loader/func/functions";
import { EPerm }               from "@shared/Enum/User.Enum";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PanelAdminLoaderProps {
	branches : GithubBranch[];
}

const loader : LoaderFunction = async() => {

	const Branches = await tRPC_Public.github.branches.query().catch( () => {
	} );

	const branches = Branches?.branches || [];

	return sendWithPermission<PanelAdminLoaderProps>( { branches }, EPerm.ManagePanel );
};

export { loader };