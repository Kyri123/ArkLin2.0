import {
	apiHandleError,
	apiPublic,
	fireSwalFromApi
} from "@app/Lib/tRPC";
import { IconButton } from "@comp/Elements/Buttons";
import { Checkbox } from "@comp/Elements/SmartInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAuth from "@hooks/useAuth";
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


const Component: FunctionComponent = () => {
	const navigate = useNavigate();
	const { setToken } = useAuth();
	const [ inputState, setInputState ] = useState<boolean[]>( [] );
	const [ stayLoggedIn, setStayLoggedIn ] = useState( false );
	const [ isSending, setIsSending ] = useState( false );
	const [ passwortUrl, setPasswortUrl ] = useState<string | null>( null );

	const loginRef = useRef<HTMLInputElement>( null );
	const passwordRef = useRef<HTMLInputElement>( null );

	const doLogin = async() => {
		setIsSending( true );

		const target = {
			login: loginRef.current?.value || "",
			password: passwordRef.current?.value || ""
		};

		setInputState( [ target.login.trim() === "", target.password.trim() === "" ] );

		const response = await apiPublic.login.mutate( {
			login: target.login,
			password: target.password,
			stayLoggedIn
		} ).catch( apiHandleError );

		if( response ) {
			if( response.passwordResetToken ) {
				setPasswortUrl( () => `/auth/reset/${ response.passwordResetToken }` );
				navigate( `/auth/reset/${ response.passwordResetToken }`, { replace: true } );
				fireSwalFromApi( response.message, true );
			} else if( response.token ) {
				setToken( response.token );
				await fireSwalFromApi( response.message, true );
				navigate( "/app", { replace: true } );
			}
			setInputState( [ false, false ] );
		} else {
			setInputState( [ true, true ] );
		}

		setIsSending( false );
	};

	return (
		<>

			<FloatingLabel controlId="login"
				label="E-Mail / Benutzername"
				className="mb-3">
				<Form.Control type="text" ref={ loginRef } isInvalid={ inputState[ 0 ] } />
			</FloatingLabel>

			<FloatingLabel controlId="password" label="Passwort" className="mb-3">
				<Form.Control type="password"
					ref={ passwordRef }
					isInvalid={ inputState[ 1 ] } />
			</FloatingLabel>

			<Row>
				<Col span={ 6 }>
					<Checkbox onValueChanges={ setStayLoggedIn } Checked={ stayLoggedIn }>
						Eingeloggt bleiben
					</Checkbox>
				</Col>
				<Col span={ 6 }>
					<IconButton className="w-100 mb-2 rounded-3"
						onClick={ doLogin }
						varian="primary"
						IsLoading={ isSending }>
						<FontAwesomeIcon icon="sign-in" className="pe-2" />
						Einloggen
					</IconButton>
				</Col>
			</Row>

			{ passwortUrl &&
				<Link to={ passwortUrl } className="btn btn-primary btn-sm mt-2 w-full">Du wirst nicht Weitergeleitet?
					Klicke
					hier!</Link> }

			<hr className="my-4" />
			<Link className="w-100 mb-3 rounded-3 btn btn-dark" to="/auth/register">Account Erstellen</Link>
		</>
	);
};


export { Component };

