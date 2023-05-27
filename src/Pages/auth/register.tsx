import {
    apiHandleError,
    apiPublic,
    fireSwalFromApi
} from "@app/Lib/tRPC";
import { IconButton } from "@comp/Elements/Buttons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FunctionComponent } from "react";
import {
    useRef,
    useState
} from "react";
import {
    Col,
    FloatingLabel,
    Form,
    Row
} from "react-bootstrap";
import {
    Link,
    useNavigate
} from "react-router-dom";
import useAuth from "../../Hooks/useAuth";


const Component: FunctionComponent = () => {
	const navigate = useNavigate();
	const { SetToken } = useAuth();
	const [ InputState, setInputState ] = useState<boolean[]>( [] );

	const [ IsSending, setIsSending ] = useState( false );

	const LoginRef = useRef<HTMLInputElement>( null );
	const PasswordRef = useRef<HTMLInputElement>( null );
	const Password2Ref = useRef<HTMLInputElement>( null );
	const EmailRef = useRef<HTMLInputElement>( null );
	const CodeRef = useRef<HTMLInputElement>( null );

	const OnReg = async() => {
		setIsSending( true );
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

		if( !InputState.find( e => e ) ) {
			const Response = await apiPublic.register.mutate( {
				username: target.user,
				email: target.email,
				password: target.password,
				key: target.accountkey
			} ).catch( apiHandleError );

			if( Response ) {
				SetToken( Response.sessionToken );
				await fireSwalFromApi( Response.message, true );
				navigate( "/app", { replace: true } );
			}
		}

		setIsSending( false );
	};

	return (
		<>
			<FloatingLabel controlId="login" label="Benutzername" className="mb-3">
				<Form.Control type="text" ref={ LoginRef } isInvalid={ InputState[ 0 ] } />
			</FloatingLabel>

			<FloatingLabel controlId="mail" label="E-Mail" className="mb-3">
				<Form.Control type="email" ref={ EmailRef } isInvalid={ InputState[ 1 ] } />
			</FloatingLabel>

			<FloatingLabel controlId="password1" label="Passwort" className="mb-3">
				<Form.Control type="password"
					ref={ PasswordRef }
					isInvalid={ InputState[ 2 ] } />
			</FloatingLabel>

			<FloatingLabel controlId="password2"
				label="Passwort Wiederholen"
				className="mb-3">
				<Form.Control type="password"
					ref={ Password2Ref }
					isInvalid={ InputState[ 3 ] } />
			</FloatingLabel>

			<FloatingLabel controlId="code"
				label="Account Schlüssel"
				className="mb-3">
				<Form.Control type="text" ref={ CodeRef } isInvalid={ InputState[ 4 ] } />
			</FloatingLabel>

			<Row>
				<Col>
					<IconButton className="w-100 mb-2 rounded-3"
						onClick={ OnReg }
						varian="primary"
						IsLoading={ IsSending }>
						<FontAwesomeIcon icon="sign-in" className="pe-2" />
						Account Erstellen und Einloggen
					</IconButton>
				</Col>
			</Row>

			<hr className="my-4" />
			<Link className="w-100 mb-3 rounded-3 btn btn-dark" to="/auth/login">Einloggen</Link>
		</>
	);
};


export { Component };
