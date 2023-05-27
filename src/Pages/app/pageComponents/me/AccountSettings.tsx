import {
    apiAuth,
    apiHandleError,
    successSwal
} from "@app/Lib/tRPC";
import { IconButton } from "@comp/Elements/Buttons";
import TableInput from "@comp/Elements/TableInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAccount from "@hooks/useAccount";
import { useCopy } from "@kyri123/k-reactutils";
import type { ClientUserAccount } from "@server/MongoDB/MongoAccounts";
import {
    useEffect,
    useState
} from "react";
import {
    Card,
    FormControl,
    InputGroup,
    Table
} from "react-bootstrap";
import { BiCopy } from "react-icons/all";


export default function AccountSettings() {
	const { user } = useAccount();
	const [ IsSending, setIsSending ] = useState( false );
	const [ Form, setForm ] = useState<ClientUserAccount>( () => user.get );
	const [ [ NewPassword, NewPasswordAgain ], setNewPassword ] = useState( [ "", "" ] );
	const [ DisableSend, setDisableSend ] = useState( false );
	const [ apiKey, setApiKey ] = useState( "" );
	const [ DoCopy, IsCopied ] = useCopy( apiKey );

	useEffect( () => {
		const Username = Form.username.length >= 6;
		const Mail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test( Form.mail );
		const Password =
			( NewPassword === "" && NewPasswordAgain === "" ) ||
			( NewPasswordAgain === NewPassword && NewPassword.length >= 6 );
		setDisableSend( !( Username && Mail && Password ) );
	}, [ NewPassword, NewPasswordAgain, Form ] );

	const SaveSettings = async() => {
		setIsSending( true );
		await apiAuth.user.update.mutate( {
			data: {
				username: Form.username,
				mail: Form.mail,
				password: NewPassword
			}
		} ).then( successSwal ).catch( apiHandleError );
		setIsSending( false );
	};

	const generateKey = async() => {
		setIsSending( true );
		await apiAuth.user.updateApiKey.mutate().then( setApiKey ).catch( apiHandleError );
		setIsSending( false );
	};

	return (
		<>
			<Card.Body className="p-0">
				<Table className="p-0 m-0" striped>
					<tbody>
						<TableInput InputAlert={ Form.username.length < 6 ? "is-invalid" : "" }
							Value={ Form.username }
							onValueSet={ Value => setForm( { ...Form, username: Value } ) }>
						Benutzername
						</TableInput>

						<TableInput Type="email"
							InputAlert={
								!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test( Form.mail )
									? "is-invalid"
									: ""
							}
							Value={ Form.mail }
							onValueSet={ Value => setForm( { ...Form, mail: Value } ) }>
						E-Mail
						</TableInput>

						<TableInput Type="password"
							InputAlert={
								( NewPassword.length < 6 && NewPassword !== "" ) ||
							NewPasswordAgain !== NewPassword
									? "is-invalid"
									: NewPasswordAgain === NewPassword && NewPassword.length >= 6
										? "is-valid"
										: ""
							}
							Value={ NewPassword }
							onValueSet={ Value => setNewPassword( [ Value, NewPasswordAgain ] ) }>
						Neues Password
						</TableInput>

						<TableInput Type="password"
							InputAlert={
								NewPasswordAgain !== NewPassword
									? "is-invalid"
									: NewPassword.length >= 6
										? "is-valid"
										: ""
							}
							Value={ NewPasswordAgain }
							onValueSet={ Value => setNewPassword( [ NewPassword, Value ] ) }>
						Neues Password wiederholen
						</TableInput>

						<tr>
							<td>Dein Api Key (einmalig lesbar!)</td>
							<td>
								<InputGroup>
									<FormControl readOnly={ true } disabled={ true } value={ apiKey } />
									<IconButton variant="success" onClick={ () => DoCopy( apiKey ) }
								            IsLoading={ IsCopied() }><BiCopy /></IconButton>
									<IconButton onClick={ generateKey }>Generate Api Key</IconButton>
								</InputGroup>
							</td>
						</tr>
					</tbody>
				</Table>
			</Card.Body>
			<Card.Footer>
				<IconButton onClick={ SaveSettings }
					disabled={ DisableSend }
					IsLoading={ IsSending }>
					<FontAwesomeIcon icon="save" /> Speichern{ " " }
				</IconButton>
			</Card.Footer>
		</>
	);
}
