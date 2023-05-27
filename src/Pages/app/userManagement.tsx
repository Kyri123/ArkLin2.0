import {
	apiAuth,
	apiHandleError
} from "@app/Lib/tRPC";
import { IconButton } from "@comp/Elements/Buttons";
import PageManager from "@comp/PageManager";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { QueryRange } from "@hooks/useRawPageHandler";
import { useRawPageHandler } from "@hooks/useRawPageHandler";
import { useToggle } from "@kyri123/k-reactutils";
import type { UserManagementLoaderProps } from "@page/app/loader/userManagement";
import AccountKeyManager from "@page/app/pageComponents/userManagement/AccountKeyManager";
import type { FC } from "react";
import { useState } from "react";
import { ButtonGroup } from "react-bootstrap";
import { useLoaderData } from "react-router-dom";
import UserRow from "./pageComponents/userManagement/UserRow";


const Component: FC = () => {
	const { accs, totalAccounts, totalKeys, keys } = useLoaderData() as UserManagementLoaderProps;

	const [ accounts, setAccounts ] = useState( () => accs );
	const [ total, setTotal ] = useState( () => totalAccounts );

	const [ showKeys, toggleShowKeys ] = useToggle( false );

	async function onPageChange( range: QueryRange ) {
		await apiAuth.admin.account.getalluser.query( range )
			.then( r => {
				setAccounts( r.accounts );
				setTotal( r.total );
			} )
			.catch( apiHandleError );
	}

	const { setPage, currentPage, maxPage, refresh } = useRawPageHandler( total, onPageChange, 10 );

	return (
		<>
			<ButtonGroup className="mb-3 w-full">
				<IconButton IsLoading={ false } onClick={ toggleShowKeys }>
					<FontAwesomeIcon icon="key" /> Account Keys
				</IconButton>
			</ButtonGroup>

			<table className="table table-striped w-100 border">
				<thead>
					<tr>
						<th>Id</th>
						<th>User</th>
						<th>E-Mail</th>
						<th style={ { width: 0 } }>Actions</th>
					</tr>
				</thead>
				<tbody>
					{ accounts.map( User => (
						<UserRow refresh={ refresh }
							User={ User }
							key={ User._id } />
					) ) }
				</tbody>
			</table>

			<PageManager MaxPage={ maxPage } Page={ currentPage } onPageChange={ setPage } />
			<AccountKeyManager show={ showKeys } onHide={ toggleShowKeys } initKeys={ keys } initCount={ totalKeys } />
		</>
	);
};

export { Component };

