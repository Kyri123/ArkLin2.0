import {
	apiAuth,
	apiHandleError,
	fireSwalFromApi
} from "@app/Lib/tRPC";
import {
	IconButton,
	ToggleButton
} from "@comp/Elements/Buttons";
import PageManager from "@comp/PageManager";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { QueryRange } from "@hooks/useRawPageHandler";
import { useRawPageHandler } from "@hooks/useRawPageHandler";
import AccountKeyRow from "@page/app/pageComponents/userManagement/AccountKeyRow";
import type { AccountKey } from "@server/MongoDB/MongoAccountKey";
import type { FunctionComponent } from "react";
import { useState } from "react";
import {
	Card,
	Modal
} from "react-bootstrap";


interface AccountKeyManagerProps {
	show: boolean,
	onHide: () => void,
	initKeys: AccountKey[],
	initCount: number
}

const AccountKeyManager: FunctionComponent<AccountKeyManagerProps> = ( { show, onHide, initKeys, initCount } ) => {
	const [ isSending, setIsSending ] = useState( false );
	const [ keys, setKeys ] = useState( () => initKeys );
	const [ total, setTotal ] = useState( () => initCount );
	const [ asAdminKey, toggleAsAdminKey ] = useState( false );

	async function onPageChange( range: QueryRange ) {
		await apiAuth.admin.account.getallkeys.query( range )
			.then( r => {
				setKeys( r.keys );
				setTotal( r.total );
			} )
			.catch( apiHandleError );
	}

	const { setPage, currentPage, maxPage, refresh } = useRawPageHandler( total, onPageChange, 10 );

	const createAccountKey = async() => {
		setIsSending( true );
		const result = await apiAuth.admin.account.createAccountKey.mutate( asAdminKey ).catch( apiHandleError );
		if( result ) {
			fireSwalFromApi( result, true );
			await refresh();
		}
		setIsSending( false );
	};

	return (
		<Modal size="lg" show={ show } onHide={ onHide }>
			<Modal.Header closeButton>
				<Modal.Title id="example-modal-sizes-title-sm">
					Account Keys
				</Modal.Title>
			</Modal.Header>
			<Modal.Body className="p-0">
				<table className="table table-striped w-100 m-0">
					<thead>
						<tr>
							<th>Key</th>
							<th>Rolle</th>
							<th style={ { width: 0 } }>Aktionen</th>
						</tr>
					</thead>
					<tbody>
						{ keys.map( Key => (
							<AccountKeyRow refresh={ refresh } Key={ Key } key={ Key._id } />
						) ) }
					</tbody>
				</table>
			</Modal.Body>
			<Modal.Footer>
				<PageManager MaxPage={ maxPage } Page={ currentPage } onPageChange={ setPage } />
				<Card className="m-0">
					<div className="input-group">
						<div className="input-group-append">
							<ToggleButton className="btn-sm flat" Value={ asAdminKey }
							              onToggle={ toggleAsAdminKey }>
								{ asAdminKey ? "Super Admin" : "Member" }
							</ToggleButton>
							<IconButton onClick={ createAccountKey }
								className="btn-sm flat"
								IsLoading={ isSending }
								variant="success">
								<FontAwesomeIcon icon="plus" /> Key Erstellen
							</IconButton>
						</div>
					</div>
				</Card>
			</Modal.Footer>
		</Modal>
	);
};

export default AccountKeyManager;
