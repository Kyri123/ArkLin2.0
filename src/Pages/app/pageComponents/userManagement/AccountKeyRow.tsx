import {
	apiAuth,
	apiHandleError,
	fireSwalFromApi
} from "@app/Lib/tRPC";
import { IconButton } from "@comp/Elements/Buttons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCopy } from "@kyri123/k-reactutils";
import type { AccountKey } from "@server/MongoDB/MongoAccountKey";
import type React from "react";
import { useState } from "react";
import { ButtonGroup } from "react-bootstrap";


interface IProps {
	Key: AccountKey,
	refresh: () => void
}

const UserRow: React.FunctionComponent<IProps> = ( { Key, refresh } ) => {
	const [ isSending, setIsSending ] = useState( false );


	const [ doCopy, isCopied ] = useCopy<string>( Key.key, 2000 );

	const removeKey = async() => {
		setIsSending( true );
		const accept = await fireSwalFromApi( "Möchtest du wirklich diesen schlüssel löschen?", "question", {
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Ja",
			cancelButtonText: "Nein",
			timer: 5000
		} );
		if( accept?.isConfirmed ) {
			const result = await apiAuth.admin.account.removeAccountKey.mutate( Key._id! ).catch( apiHandleError );
			if( result ) {
				fireSwalFromApi( result, true );
				await refresh();
			}
		}
		setIsSending( false );
	};

	return (
		<tr>
			<td>{ Key.key }</td>
			<td>{ Key.asSuperAdmin ? "Super Admin" : "Member" }</td>
			<td style={ { width: 0 } } className="p-2">
				<ButtonGroup>
					<IconButton onClick={ removeKey }
						className="btn-sm rounded-0"
						IsLoading={ isSending }
						variant="danger">
						<FontAwesomeIcon icon="trash-alt" />
					</IconButton>
					<IconButton disabled={ isCopied( Key._id ) }
						onClick={ () => doCopy( Key.key!, Key._id ) }
						className="btn-sm rounded-0"
						IsLoading={ false }
						variant="success">
						<FontAwesomeIcon icon={ isCopied( Key._id ) ? "check" : "copy" } />
					</IconButton>
				</ButtonGroup>
			</td>
		</tr>
	);
};

export default UserRow;
