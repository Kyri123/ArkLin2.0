import type { LoaderFunction } from "react-router-dom";
import { tRPC_Auth }           from "@app/Lib/tRPC";
import type { UserAccount }    from "@server/MongoDB/DB_Accounts";
import { sendWithPermission }  from "@page/app/loader/func/functions";
import { EPerm }               from "@shared/Enum/User.Enum";
import type { AccountKey }     from "@server/MongoDB/DB_AccountKey";

export interface UserManagementLoaderProps {
	accs : UserAccount[];
	totalAccounts : number;
	keys : AccountKey[];
	totalKeys : number;
}

const loader : LoaderFunction = async() => {
	const accountsResult = await tRPC_Auth.admin.account.getalluser.query( { skip: 0, limit: 10 } ).catch( () => {
	} );
	const keysResult = await tRPC_Auth.admin.account.getallkeys.query( { skip: 0, limit: 10 } ).catch( () => {
	} );

	const accs : UserAccount[] = accountsResult?.accounts || [];
	const totalAccounts : number = accountsResult?.total || 0;
	const keys : AccountKey[] = keysResult?.keys || [];
	const totalKeys : number = keysResult?.total || 0;

	return sendWithPermission<UserManagementLoaderProps>( { accs, totalAccounts, keys, totalKeys }, EPerm.Super );
};

export { loader };