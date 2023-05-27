import { apiPublic } from "@app/Lib/tRPC";
import { sendWithPermission } from "@page/app/loader/func/functions";
import type { GithubBranch } from "@server/MongoDB/MongoGithubBranches";
import { EPerm } from "@shared/Enum/User.Enum";
import type { LoaderFunction } from "react-router-dom";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PanelAdminLoaderProps {
	branches: GithubBranch[]
}

const loader: LoaderFunction = async() => {

	const resultBranches = await apiPublic.github.branches.query().catch( () => {
	} );

	const branches = resultBranches?.branches || [];

	return sendWithPermission<PanelAdminLoaderProps>( { branches }, EPerm.ManagePanel );
};

export { loader };

