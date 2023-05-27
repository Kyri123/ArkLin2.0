import { apiAuth } from "@app/Lib/tRPC";
import { sendWithPermission } from "@page/app/loader/func/functions";
import type { AccountKey } from "@server/MongoDB/MongoAccountKey";
import type { UserAccount } from "@server/MongoDB/MongoAccounts";
import { EPerm } from "@shared/Enum/User.Enum";
import type { LoaderFunction } from "react-router-dom";


export interface UserManagementLoaderProps {
	accs: UserAccount[],
	totalAccounts: number,
	keys: AccountKey[],
	totalKeys: number
}

const loader: LoaderFunction = async() => {
	const accountsResult = await apiAuth.admin.account.getalluser.query( { skip: 0, limit: 10 } ).catch( () => {
	} );
	const keysResult = await apiAuth.admin.account.getallkeys.query( { skip: 0, limit: 10 } ).catch( () => {
	} );

	const accs: UserAccount[] = accountsResult?.accounts || [];
	const totalAccounts: number = accountsResult?.total || 0;
	const keys: AccountKey[] = keysResult?.keys || [];
	const totalKeys: number = keysResult?.total || 0;

	return sendWithPermission<UserManagementLoaderProps>( { accs, totalAccounts, keys, totalKeys }, EPerm.Super );
};

export { loader };

