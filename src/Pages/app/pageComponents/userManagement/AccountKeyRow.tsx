import type React          from "react";
import { useState }        from "react";
import { ButtonGroup }     from "react-bootstrap";
import { IconButton }      from "@comp/Elements/Buttons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCopy }         from "@kyri123/k-reactutils";
import type { AccountKey } from "@server/MongoDB/DB_AccountKey";
import {
	fireSwalFromApi,
	tRPC_Auth,
	tRPC_handleError
}                          from "@app/Lib/tRPC";

interface IProps {
	Key : AccountKey;
	refresh : () => void;
}

const UserRow : React.FunctionComponent<IProps> = ( { Key, refresh } ) => {
	const [ IsSending, setIsSending ] = useState( false );


	const [ DoCopy, IsCopied ] = useCopy<string>( Key.key, 2000 );

	const removeKey = async() => {
		setIsSending( true );
		const accept = await fireSwalFromApi( "Möchtest du wirklich diesen schlüssel löschen?", "question", {
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Ja",
			cancelButtonText: "Nein",
			timer: 5000
		} );
		if ( accept?.isConfirmed ) {
			const result = await tRPC_Auth.admin.account.removeAccountKey.mutate( Key._id! ).catch( tRPC_handleError );
			if ( result ) {
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
					<IconButton
						onClick={ removeKey }
						className={ "btn-sm rounded-0" }
						IsLoading={ IsSending }
						variant="danger"
					>
						<FontAwesomeIcon icon={ "trash-alt" }/>
					</IconButton>
					<IconButton
						disabled={ IsCopied( Key._id ) }
						onClick={ () => DoCopy( Key.key!, Key._id ) }
						className={ "btn-sm rounded-0" }
						IsLoading={ false }
						variant="success"
					>
						<FontAwesomeIcon
							icon={ IsCopied( Key._id ) ? "check" : "copy" }
						/>
					</IconButton>
				</ButtonGroup>
			</td>
		</tr>
	);
};

export default UserRow;
