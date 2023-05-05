import type React          from "react";
import { useState }        from "react";
import { ButtonGroup }     from "react-bootstrap";
import { IconButton }      from "@comp/Elements/AdminLTE/Buttons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCopy }         from "@kyri123/k-reactutils";
import type { AccountKey }      from "@server/MongoDB/DB_AccountKey";

interface IProps {
	Key : AccountKey;
}

const UserRow : React.FunctionComponent<IProps> = ( { Key } ) => {
	const [ IsSending, setIsSending ] = useState( false );


	const [ DoCopy, IsCopied ] = useCopy<string>( Key.key, 2000 );

	const removeKey = async() => {
	};

	return (
		<tr>
			<td>{ Key.key }</td>
			<td>{ Key.asSuperAdmin ? "Super Admin" : "Member" }</td>
			<td style={ { width: 0 } } className="p-2">
				<ButtonGroup>
					<IconButton
						onClick={ removeKey }
						className={ "btn-sm flat" }
						IsLoading={ IsSending }
						variant="danger"
					>
						<FontAwesomeIcon icon={ "trash-alt" }/>
					</IconButton>
					<IconButton
						disabled={ IsCopied( Key._id ) }
						onClick={ () => DoCopy( Key.key!, Key._id ) }
						className={ "btn-sm flat" }
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
