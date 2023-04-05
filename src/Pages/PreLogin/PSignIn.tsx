import {
	useRef,
	useState
}                               from "react";
import { CAlert }               from "../../Components/Elements/CAlert";
import { FontAwesomeIcon }      from "@fortawesome/react-fontawesome";
import { IAPIResponseBase }     from "../../Types/API";
import { API_AuthLib }          from "../../Lib/Api/API_Auth.Lib";
import { IAccountInformations } from "../../Shared/Type/User";
import { CLTECheckbox }         from "../../Components/Elements/AdminLTE/AdminLTE_Inputs";
import useAuth                  from "../../Hooks/useAuth";
import {
	Col,
	FloatingLabel,
	Form,
	Row
}                               from "react-bootstrap";
import { LTELoadingButton }     from "../../Components/Elements/AdminLTE/AdminLTE_Buttons";

export default function PSignIn() {
	const { SetToken } = useAuth();
	const [ InputState, setInputState ] = useState<boolean[]>( [] );
	const [ Response, setResponse ] = useState<IAPIResponseBase<IAccountInformations> | undefined>();
	const [ StayLoggedIn, setStayLoggedIn ] = useState( false );
	const [ IsSending, setIsSending ] = useState( false );

	const LoginRef = useRef<HTMLInputElement>( null );
	const PasswordRef = useRef<HTMLInputElement>( null );

	const DoLogin = async() => {
		setIsSending( true );

		const target = {
			login: LoginRef.current?.value || "",
			password: PasswordRef.current?.value || ""
		};

		setInputState( [
			target.login.trim() === "",
			target.password.trim() === ""
		] );

		const Response = await API_AuthLib.DoLogin( {
			login: target.login,
			password: target.password,
			stayloggedin: StayLoggedIn
		} );

		if ( Response.Data && Response.Auth ) {
			SetToken( Response.Data.JsonWebToken );
			window.location.href = "/home";
		}
		else {
			setInputState( [
				true,
				true
			] );
		}

		setResponse( Response );
		setIsSending( false );
	}

	return (
		<>
			<CAlert OnClear={ () => {
				if ( Response ) {
					const Copy : IAPIResponseBase<IAccountInformations> | undefined = structuredClone( Response );
					if ( Copy ) {
						Copy.Message = undefined;
						setResponse( Copy );
					}
				}
			} } Data={ Response }/>

			<FloatingLabel controlId="login" label="E-Mail / Benutzername" className="mb-3">
				<Form.Control type="text" ref={ LoginRef } isInvalid={ InputState[ 0 ] }/>
			</FloatingLabel>

			<FloatingLabel controlId="password" label="Passwort" className="mb-3">
				<Form.Control type="password" ref={ PasswordRef } isInvalid={ InputState[ 1 ] }/>
			</FloatingLabel>

			<Row>
				<Col span={ 6 }>
					<CLTECheckbox OnValueChanges={ setStayLoggedIn } Checked={ StayLoggedIn }>Eingeloggt
						bleiben</CLTECheckbox>
				</Col>
				<Col span={ 6 }>
					<LTELoadingButton className="w-100 mb-2 rounded-3" onClick={ DoLogin } varian="primary"
									  IsLoading={ IsSending }>
						<FontAwesomeIcon icon={ "sign-in" } className={ "pe-2" }/>
						Einloggen
					</LTELoadingButton>
				</Col>
			</Row>
		</>
	);
}