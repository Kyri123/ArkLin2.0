import type { FunctionComponent } from "react";
import {
	useRef,
	useState
}                                 from "react";
import { FontAwesomeIcon }        from "@fortawesome/react-fontawesome";
import { CLTECheckbox }           from "@comp/Elements/AdminLTE/AdminLTE_Inputs";
import useAuth                    from "@hooks/useAuth";
import {
	Col,
	FloatingLabel,
	Form,
	Row
}                                 from "react-bootstrap";
import { LTELoadingButton }       from "@comp/Elements/AdminLTE/AdminLTE_Buttons";
import {
	Link,
	useNavigate
}                                 from "react-router-dom";
import {
	fireSwalFromApi,
	tRPC_handleError,
	tRPC_Public
}                                 from "@app/Lib/tRPC";

const Component : FunctionComponent = () => {
	const navigate = useNavigate();
	const { SetToken } = useAuth();
	const [ InputState, setInputState ] = useState<boolean[]>( [] );
	const [ stayLoggedIn, setStayLoggedIn ] = useState( false );
	const [ IsSending, setIsSending ] = useState( false );

	const LoginRef = useRef<HTMLInputElement>( null );
	const PasswordRef = useRef<HTMLInputElement>( null );

	const DoLogin = async() => {
		setIsSending( true );

		const target = {
			login: LoginRef.current?.value || "",
			password: PasswordRef.current?.value || ""
		};

		setInputState( [ target.login.trim() === "", target.password.trim() === "" ] );

		const Response = await tRPC_Public.login.mutate( {
			login: target.login,
			password: target.password,
			stayLoggedIn
		} ).catch( tRPC_handleError );
 
		if ( Response ) {
			if ( Response.passwordResetToken ) {
				fireSwalFromApi( Response.message, true );
				navigate( `/auth/reset/${ Response.passwordResetToken }` );
			}
			else if ( Response.token ) {
				fireSwalFromApi( Response.message, true );
				SetToken( Response.token );
				navigate( 0 );
			}
			setInputState( [ false, false ] );
		}
		else {
			setInputState( [ true, true ] );
		}

		setIsSending( false );
	};

	return (
		<>
			<FloatingLabel
				controlId="login"
				label="E-Mail / Benutzername"
				className="mb-3"
			>
				<Form.Control type="text" ref={ LoginRef } isInvalid={ InputState[ 0 ] }/>
			</FloatingLabel>

			<FloatingLabel controlId="password" label="Passwort" className="mb-3">
				<Form.Control
					type="password"
					ref={ PasswordRef }
					isInvalid={ InputState[ 1 ] }
				/>
			</FloatingLabel>

			<Row>
				<Col span={ 6 }>
					<CLTECheckbox OnValueChanges={ setStayLoggedIn } Checked={ stayLoggedIn }>
						Eingeloggt bleiben
					</CLTECheckbox>
				</Col>
				<Col span={ 6 }>
					<LTELoadingButton
						className="w-100 mb-2 rounded-3"
						onClick={ DoLogin }
						varian="primary"
						IsLoading={ IsSending }
					>
						<FontAwesomeIcon icon={ "sign-in" } className={ "pe-2" }/>
						Einloggen
					</LTELoadingButton>
				</Col>
			</Row>

			<hr className="my-4"/>
			<Link className="w-100 mb-3 rounded-3 btn btn-dark" to={ "/auth/register" }>Account Erstellen</Link>
		</>
	);
};


export { Component };