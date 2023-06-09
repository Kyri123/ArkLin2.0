import type { FunctionComponent } from "react";
import {
	useRef,
	useState
}                                 from "react";
import useAuth                    from "@hooks/useAuth";
import {
	Col,
	FloatingLabel,
	Form,
	Row
}                                 from "react-bootstrap";
import { IconButton }             from "@comp/Elements/Buttons";
import { FontAwesomeIcon }        from "@fortawesome/react-fontawesome";
import {
	Link,
	useNavigate,
	useParams
}                                 from "react-router-dom";
import {
	fireSwalFromApi,
	tRPC_handleError,
	tRPC_Public
}                                 from "@app/Lib/tRPC";

const Component : FunctionComponent = () => {
	const { token } = useParams<{ token : string }>();
	const navigate = useNavigate();
	const { SetToken } = useAuth();
	const [ InputState, setInputState ] = useState<boolean[]>( [] );

	const [ IsSending, setIsSending ] = useState( false );

	const PasswordRef = useRef<HTMLInputElement>( null );
	const Password2Ref = useRef<HTMLInputElement>( null );

	const OnReg = async() => {
		setIsSending( true );
		const target = {
			password: PasswordRef.current?.value || "",
			passwordagain: Password2Ref.current?.value || ""
		};

		setInputState( [
			target.passwordagain !== target.password ||
			target.passwordagain.length < 7
		] );

		if ( !InputState.find( ( e ) => e ) ) {
			const Response = await tRPC_Public.password.mutate( {
				key: token!,
				password: target.password
			} ).catch( tRPC_handleError );

			if ( Response ) {
				SetToken( Response.sessionToken );
				await fireSwalFromApi( Response.message, true );
				navigate( "/app", { replace: true } );
			}
		}

		setIsSending( false );
	};

	return (
		<>
			<FloatingLabel controlId="password1" label="Passwort" className="mb-3">
				<Form.Control
					type="password"
					ref={ PasswordRef }
					isInvalid={ InputState[ 0 ] }
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
					isInvalid={ InputState[ 1 ] }
				/>
			</FloatingLabel>

			<Row>
				<Col>
					<IconButton
						className="w-100 mb-2 rounded-3"
						onClick={ OnReg }
						varian="primary"
						IsLoading={ IsSending }
					>
						<FontAwesomeIcon icon={ "sign-in" } className={ "pe-2" }/>
						Passwort festlegen und Einloggen
					</IconButton>
				</Col>
			</Row>

			<hr className="my-4"/>
			<Link className="w-100 mb-3 rounded-3 btn btn-dark" to={ "/auth/login" }>Einloggen</Link>
		</>
	);
};

export { Component };