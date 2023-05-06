import {
	useEffect,
	useState
}                                 from "react";
import {
	Card,
	FormControl,
	InputGroup,
	Table
}                                 from "react-bootstrap";
import { IconButton }             from "@comp/Elements/Buttons";
import { FontAwesomeIcon }        from "@fortawesome/react-fontawesome";
import useAccount                 from "@hooks/useAccount";
import TableInput                 from "@comp/Elements/TableInput";
import {
	successSwal,
	tRPC_Auth,
	tRPC_handleError
}                                 from "@app/Lib/tRPC";
import type { ClientUserAccount } from "@server/MongoDB/DB_Accounts";
import { BiCopy }                 from "react-icons/all";
import { useCopy }                from "@kyri123/k-reactutils";

export default function AccountSettings() {
	const { user } = useAccount();
	const [ IsSending, setIsSending ] = useState( false );
	const [ Form, setForm ] = useState<ClientUserAccount>( () => user.Get );
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
		await tRPC_Auth.user.update.mutate( {
			data: {
				username: Form.username,
				mail: Form.mail,
				password: NewPassword
			}
		} ).then( successSwal ).catch( tRPC_handleError );
		setIsSending( false );
	};

	const generateKey = async() => {
		setIsSending( true );
		await tRPC_Auth.user.updateApiKey.mutate().then( setApiKey ).catch( tRPC_handleError );
		setIsSending( false );
	};

	return (
		<>
			<Card.Body className="p-0">
				<Table className="p-0 m-0" striped>
					<tbody>
					<TableInput
						InputAlert={ Form.username.length < 6 ? "is-invalid" : "" }
						Value={ Form.username }
						OnValueSet={ ( Value ) => setForm( { ...Form, username: Value } ) }
					>
						Benutzername
					</TableInput>

					<TableInput
						Type={ "email" }
						InputAlert={
							!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test( Form.mail )
								? "is-invalid"
								: ""
						}
						Value={ Form.mail }
						OnValueSet={ ( Value ) => setForm( { ...Form, mail: Value } ) }
					>
						E-Mail
					</TableInput>

					<TableInput
						Type={ "password" }
						InputAlert={
							( NewPassword.length < 6 && NewPassword !== "" ) ||
							NewPasswordAgain !== NewPassword
								? "is-invalid"
								: NewPasswordAgain === NewPassword && NewPassword.length >= 6
									? "is-valid"
									: ""
						}
						Value={ NewPassword }
						OnValueSet={ ( Value ) => setNewPassword( [ Value, NewPasswordAgain ] ) }
					>
						Neues Password
					</TableInput>

					<TableInput
						Type={ "password" }
						InputAlert={
							NewPasswordAgain !== NewPassword
								? "is-invalid"
								: NewPassword.length >= 6
									? "is-valid"
									: ""
						}
						Value={ NewPasswordAgain }
						OnValueSet={ ( Value ) => setNewPassword( [ NewPassword, Value ] ) }
					>
						Neues Password wiederholen
					</TableInput>

					<tr>
						<td>Dein Api Key (einmalig lesbar!)</td>
						<td>
							<InputGroup>
								<FormControl readOnly={ true } disabled={ true } value={ apiKey }/>
								<IconButton variant={ "success" } onClick={ () => DoCopy( apiKey ) }
								            IsLoading={ IsCopied() }><BiCopy/></IconButton>
								<IconButton onClick={ generateKey }>Generate Api Key</IconButton>
							</InputGroup>
						</td>
					</tr>
					</tbody>
				</Table>
			</Card.Body>
			<Card.Footer>
				<IconButton
					onClick={ SaveSettings }
					disabled={ DisableSend }
					IsLoading={ IsSending }
				>
					<FontAwesomeIcon icon={ "save" }/> Speichern{ " " }
				</IconButton>
			</Card.Footer>
		</>
	);
}
