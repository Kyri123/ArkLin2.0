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
	const { SetToken } = useAuth();
	const [ InputState, setInputState ] = useState<boolean[]>( [] );
	const [ stayLoggedIn, setStayLoggedIn ] = useState( false );
	const [ IsSending, setIsSending ] = useState( false );
	const [ passwortUrl, setPasswortUrl ] = useState<string | null>( null );

	const LoginRef = useRef<HTMLInputElement>( null );
	const PasswordRef = useRef<HTMLInputElement>( null );

	const doLogin = async() => {
		setIsSending( true );

		const target = {
			login: LoginRef.current?.value || "",
			password: PasswordRef.current?.value || ""
		};

		setInputState( [ target.login.trim() === "", target.password.trim() === "" ] );

		const Response = await apiPublic.login.mutate( {
			login: target.login,
			password: target.password,
			stayLoggedIn
		} ).catch( apiHandleError );

		if( Response ) {
			if( Response.passwordResetToken ) {
				setPasswortUrl( () => `/auth/reset/${ Response.passwordResetToken }` );
				navigate( `/auth/reset/${ Response.passwordResetToken }`, { replace: true } );
				fireSwalFromApi( Response.message, true );
			} else if( Response.token ) {
				SetToken( Response.token );
				await fireSwalFromApi( Response.message, true );
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
				<Form.Control type="text" ref={ LoginRef } isInvalid={ InputState[ 0 ] } />
			</FloatingLabel>

			<FloatingLabel controlId="password" label="Passwort" className="mb-3">
				<Form.Control type="password"
					ref={ PasswordRef }
					isInvalid={ InputState[ 1 ] } />
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
						IsLoading={ IsSending }>
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
