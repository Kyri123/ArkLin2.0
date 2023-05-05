import {
	useContext,
	useEffect,
	useState
}                                 from "react";
import { Card }                   from "react-bootstrap";
import { IconButton }             from "@comp/Elements/AdminLTE/Buttons";
import { FontAwesomeIcon }        from "@fortawesome/react-fontawesome";
import CLTEInput                  from "../../../../Components/Elements/AdminLTE/AdminLTE_Inputs";
import { API_User }               from "@app/Lib/Api/API_User";
import AccountContext             from "@context/AccountContext";
import type { ClientUserAccount } from "@server/MongoDB/DB_Accounts";

export default function SPUser() {
	const Account = useContext( AccountContext );
	const [ IsSending, setIsSending ] = useState( false );
	const [ Form, setForm ] = useState<ClientUserAccount>( {
		...Account.Account.Get
	} );
	const [ [ NewPassword, NewPasswordAgain ], setNewPassword ] = useState( [ "", "" ] );
	const [ DisableSend, setDisableSend ] = useState( false );

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
		const Response = await API_User.UserSettings_EditAccount( Form, [
			NewPassword,
			NewPasswordAgain
		] );
		GAlert.DoSetAlert( Response );
		setIsSending( false );
	};

	return (
		<>
			<Card.Body>
				<CLTEInput
					InputAlert={ Form.username.length < 6 ? "is-invalid" : "" }
					Value={ Form.username }
					OnValueSet={ ( Value ) => setForm( { ...Form, username: Value } ) }
				>
					Benutzername
				</CLTEInput>

				<CLTEInput
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
				</CLTEInput>

				<CLTEInput
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
				</CLTEInput>

				<CLTEInput
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
				</CLTEInput>
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
