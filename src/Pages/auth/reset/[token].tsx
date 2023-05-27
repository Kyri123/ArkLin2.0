import {
	apiHandleError,
	apiPublic,
	fireSwalFromApi
} from "@app/Lib/tRPC";
import { IconButton } from "@comp/Elements/Buttons";
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
	useNavigate,
	useParams
} from "react-router-dom";


const Component: FunctionComponent = () => {
	const { token } = useParams<{ token: string }>();
	const navigate = useNavigate();
	const { setToken } = useAuth();
	const [ inputState, setInputState ] = useState<boolean[]>( [] );

	const [ isSending, setIsSending ] = useState( false );

	const passwordRef = useRef<HTMLInputElement>( null );
	const password2Ref = useRef<HTMLInputElement>( null );

	const onPasswordReset = async() => {
		setIsSending( true );
		const target = {
			password: passwordRef.current?.value || "",
			passwordagain: password2Ref.current?.value || ""
		};

		setInputState( [
			target.passwordagain !== target.password ||
			target.passwordagain.length < 7
		] );

		if( !inputState.find( e => e ) ) {
			const response = await apiPublic.password.mutate( {
				key: token!,
				password: target.password
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
			<FloatingLabel controlId="password1" label="Passwort" className="mb-3">
				<Form.Control type="password"
					ref={ passwordRef }
					isInvalid={ inputState[ 0 ] } />
			</FloatingLabel>

			<FloatingLabel controlId="password2"
				label="Passwort Wiederholen"
				className="mb-3">
				<Form.Control type="password"
					ref={ password2Ref }
					isInvalid={ inputState[ 1 ] } />
			</FloatingLabel>

			<Row>
				<Col>
					<IconButton className="w-100 mb-2 rounded-3"
						onClick={ onPasswordReset }
						varian="primary"
						IsLoading={ isSending }>
						<FontAwesomeIcon icon="sign-in" className="pe-2" />
						Passwort festlegen und Einloggen
					</IconButton>
				</Col>
			</Row>

			<hr className="my-4" />
			<Link className="w-100 mb-3 rounded-3 btn btn-dark" to="/auth/login">Einloggen</Link>
		</>
	);
};

export { Component };

