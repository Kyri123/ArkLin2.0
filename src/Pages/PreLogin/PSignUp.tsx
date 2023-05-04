import {
	useRef,
	useState
}                                         from "react";
import type { TResponse_Auth_IsLoggedIn } from "@shared/Type/API_Response";
import { CAlert }                         from "../MainApp/PageComponents/General/CAlert";
import { FontAwesomeIcon }                from "@fortawesome/react-fontawesome";
import { API_AuthLib }                    from "../../Lib/Api/API_Auth.Lib";
import useAuth                            from "../../Hooks/useAuth";
import {
	Col,
	FloatingLabel,
	Form,
	Row
}                                         from "react-bootstrap";
import { LTELoadingButton }               from "../Components/Elements/AdminLTE/AdminLTE_Buttons";

export default function PSignUp() {
	const { SetToken } = useAuth();
	const [ InputState, setInputState ] = useState<boolean[]>( [] );
	const [ Response, setResponse ] = useState<
		TResponse_Auth_IsLoggedIn<true> | undefined
	>();

	const [ IsSending, setIsSending ] = useState( false );

	const LoginRef = useRef<HTMLInputElement>( null );
	const PasswordRef = useRef<HTMLInputElement>( null );
	const Password2Ref = useRef<HTMLInputElement>( null );
	const EmailRef = useRef<HTMLInputElement>( null );
	const CodeRef = useRef<HTMLInputElement>( null );

	const OnReg = async() => {
		setIsSending( true );
		let Resp : TResponse_Auth_IsLoggedIn<true> | undefined = undefined;

		const target = {
			user: LoginRef.current?.value || "",
			email: EmailRef.current?.value || "",
			password: PasswordRef.current?.value || "",
			passwordagain: Password2Ref.current?.value || "",
			accountkey: CodeRef.current?.value || ""
		};

		setInputState( [
			target.user.length < 6,
			!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test( target.email ),
			target.password.length < 7,
			target.passwordagain !== target.password ||
			target.passwordagain.length < 7,
			target.accountkey.length < 10
		] );

		if ( !InputState.find( ( e ) => e ) ) {
			Resp = await API_AuthLib.TryCreateAnAccount( {
				user: target.user,
				accountkey: target.accountkey,
				password: target.password,
				passwordagain: target.passwordagain,
				email: target.email
			} );

			if ( Resp ) {
				if ( Resp.Auth && Resp.Data ) {
					SetToken( Resp.Data.JsonWebToken );
					window.location.href = "/home";
				}
			}
		}

		setResponse( Resp );
		setIsSending( false );
	};

	return (
		<>
			<CAlert
				OnClear={ () => {
					setResponse( undefined );
				} }
				Data={ Response }
			/>

			<FloatingLabel controlId="login" label="Benutzername" className="mb-3">
				<Form.Control type="text" ref={ LoginRef } isInvalid={ InputState[ 0 ] }/>
			</FloatingLabel>

			<FloatingLabel controlId="mail" label="E-Mail" className="mb-3">
				<Form.Control type="email" ref={ EmailRef } isInvalid={ InputState[ 1 ] }/>
			</FloatingLabel>

			<FloatingLabel controlId="password1" label="Passwort" className="mb-3">
				<Form.Control
					type="password"
					ref={ PasswordRef }
					isInvalid={ InputState[ 2 ] }
				/>
			</FloatingLabel>

			<FloatingLabel
				controlId="password2"
				label="Passwort Wiederholen"
				className="mb-3"
			>
				<Form.Control
					type="password"
					ref={ Password2Ref }
					isInvalid={ InputState[ 3 ] }
				/>
			</FloatingLabel>

			<FloatingLabel
				controlId="code"
				label="Account Schlüssel"
				className="mb-3"
			>
				<Form.Control type="text" ref={ CodeRef } isInvalid={ InputState[ 4 ] }/>
			</FloatingLabel>

			<Row>
				<Col>
					<LTELoadingButton
						className="w-100 mb-2 rounded-3"
						onClick={ OnReg }
						varian="primary"
						IsLoading={ IsSending }
					>
						<FontAwesomeIcon icon={ "sign-in" } className={ "pe-2" }/>
						Account Erstellen und Einloggen
					</LTELoadingButton>
				</Col>
			</Row>
		</>
	);
}
