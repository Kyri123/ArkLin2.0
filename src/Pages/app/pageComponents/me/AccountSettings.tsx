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
	const [ isSending, setIsSending ] = useState( false );
	const [ form, setForm ] = useState<ClientUserAccount>( () => user.get );
	const [ [ newPassword, newPasswordAgain ], setNewPassword ] = useState( [ "", "" ] );
	const [ disableSend, setDisableSend ] = useState( false );
	const [ apiKey, setApiKey ] = useState( "" );
	const [ doCopy, isCopied ] = useCopy( apiKey );

	useEffect( () => {
		const username = form.username.length >= 6;
		const mail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test( form.mail );
		const password =
			( newPassword === "" && newPasswordAgain === "" ) ||
			( newPasswordAgain === newPassword && newPassword.length >= 6 );
		setDisableSend( !( username && mail && password ) );
	}, [ newPassword, newPasswordAgain, form ] );

	const saveSettings = async() => {
		setIsSending( true );
		await apiAuth.user.update.mutate( {
			data: {
				username: form.username,
				mail: form.mail,
				password: newPassword
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
						<TableInput InputAlert={ form.username.length < 6 ? "is-invalid" : "" }
							Value={ form.username }
							onValueSet={ Value => setForm( { ...form, username: Value } ) }>
						Benutzername
						</TableInput>

						<TableInput Type="email"
							InputAlert={
								!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test( form.mail )
									? "is-invalid"
									: ""
							}
							Value={ form.mail }
							onValueSet={ Value => setForm( { ...form, mail: Value } ) }>
						E-mail
						</TableInput>

						<TableInput Type="password"
							InputAlert={
								( newPassword.length < 6 && newPassword !== "" ) ||
							newPasswordAgain !== newPassword
									? "is-invalid"
									: newPasswordAgain === newPassword && newPassword.length >= 6
										? "is-valid"
										: ""
							}
							Value={ newPassword }
							onValueSet={ Value => setNewPassword( [ Value, newPasswordAgain ] ) }>
						Neues password
						</TableInput>

						<TableInput Type="password"
							InputAlert={
								newPasswordAgain !== newPassword
									? "is-invalid"
									: newPassword.length >= 6
										? "is-valid"
										: ""
							}
							Value={ newPasswordAgain }
							onValueSet={ Value => setNewPassword( [ newPassword, Value ] ) }>
						Neues password wiederholen
						</TableInput>

						<tr>
							<td>Dein Api Key (einmalig lesbar!)</td>
							<td>
								<InputGroup>
									<FormControl readOnly={ true } disabled={ true } value={ apiKey } />
									<IconButton variant="success" onClick={ () => doCopy( apiKey ) }
								            IsLoading={ isCopied() }><BiCopy /></IconButton>
									<IconButton onClick={ generateKey }>Generate Api Key</IconButton>
								</InputGroup>
							</td>
						</tr>
					</tbody>
				</Table>
			</Card.Body>
			<Card.Footer>
				<IconButton onClick={ saveSettings }
					disabled={ disableSend }
					IsLoading={ isSending }>
					<FontAwesomeIcon icon="save" /> Speichern{ " " }
				</IconButton>
			</Card.Footer>
		</>
	);
}
