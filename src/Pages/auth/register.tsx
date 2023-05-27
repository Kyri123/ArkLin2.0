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
	const { setToken } = useAuth();
	const [ inputState, setInputState ] = useState<boolean[]>( [] );

	const [ isSending, setIsSending ] = useState( false );

	const loginRef = useRef<HTMLInputElement>( null );
	const passwordRef = useRef<HTMLInputElement>( null );
	const password2Ref = useRef<HTMLInputElement>( null );
	const emailRef = useRef<HTMLInputElement>( null );
	const codeRef = useRef<HTMLInputElement>( null );

	const onReg = async() => {
		setIsSending( true );
		const target = {
			user: loginRef.current?.value || "",
			email: emailRef.current?.value || "",
			password: passwordRef.current?.value || "",
			passwordagain: password2Ref.current?.value || "",
			accountkey: codeRef.current?.value || ""
		};

		setInputState( [
			target.user.length < 6,
			!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test( target.email ),
			target.password.length < 7,
			target.passwordagain !== target.password ||
			target.passwordagain.length < 7,
			target.accountkey.length < 10
		] );

		if( !inputState.find( e => e ) ) {
			const response = await apiPublic.register.mutate( {
				username: target.user,
				email: target.email,
				password: target.password,
				key: target.accountkey
			} ).catch( apiHandleError );

			if( response ) {
				setToken( response.sessionToken );
				await fireSwalFromApi( response.message, true );
				navigate( "/app", { replace: true } );
			}
		}

		setIsSending( false );
	};

	return (
		<>
			<FloatingLabel controlId="login" label="Benutzername" className="mb-3">
				<Form.Control type="text" ref={ loginRef } isInvalid={ inputState[ 0 ] } />
			</FloatingLabel>

			<FloatingLabel controlId="mail" label="E-Mail" className="mb-3">
				<Form.Control type="email" ref={ emailRef } isInvalid={ inputState[ 1 ] } />
			</FloatingLabel>

			<FloatingLabel controlId="password1" label="Passwort" className="mb-3">
				<Form.Control type="password"
					ref={ passwordRef }
					isInvalid={ inputState[ 2 ] } />
			</FloatingLabel>

			<FloatingLabel controlId="password2"
				label="Passwort Wiederholen"
				className="mb-3">
				<Form.Control type="password"
					ref={ password2Ref }
					isInvalid={ inputState[ 3 ] } />
			</FloatingLabel>

			<FloatingLabel controlId="code"
				label="Account Schlüssel"
				className="mb-3">
				<Form.Control type="text" ref={ codeRef } isInvalid={ inputState[ 4 ] } />
			</FloatingLabel>

			<Row>
				<Col>
					<IconButton className="w-100 mb-2 rounded-3"
						onClick={ onReg }
						varian="primary"
						IsLoading={ isSending }>
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

