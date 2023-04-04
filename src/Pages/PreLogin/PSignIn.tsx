import {
	FormEvent,
	useState
}                               from "react";
import { CAlert }               from "../../Components/Elements/CAlert";
import { FontAwesomeIcon }      from "@fortawesome/react-fontawesome";
import { IAPIResponseBase }     from "../../Types/API";
import { API_AuthLib }          from "../../Lib/Api/API_Auth.Lib";
import { IAccountInformations } from "../../Shared/Type/User";
import { LTEInputWithIcon }     from "../../Components/Elements/AdminLTE/AdminLTE";
import { CLTECheckbox }         from "../../Components/Elements/AdminLTE/AdminLTE_Inputs";
import useAuth                  from "../../Hooks/useAuth";

export default function PSignIn() {
	const { SetToken } = useAuth();
	const [ InputState, setInputState ] = useState<boolean[]>( [] );
	const [ Response, setResponse ] = useState<IAPIResponseBase<IAccountInformations> | undefined>();
	const [ StayLoggedIn, setStayLoggedIn ] = useState( false );

	const OnSubmit = async( Event : FormEvent<HTMLFormElement> ) => {
		Event.preventDefault();

		const target = Event.target as typeof Event.target & {
			login : { value : string };
			password : { value : string };
		};

		setInputState( [
			target.login.value.trim() === "",
			target.password.value.trim() === ""
		] );

		const Response = await API_AuthLib.DoLogin( {
			login: target.login.value,
			password: target.password.value,
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

			<form action="#" method="post" onSubmit={ OnSubmit }>
				<LTEInputWithIcon Outline={ InputState[ 0 ] ? "is-invalid" : "" } className={ "mb-3" } Icon={ "user" }
								  InputType={ "text" } Name={ "login" } Placeholder={ "Benutzername / E-Mail" }/>
				<LTEInputWithIcon Outline={ InputState[ 1 ] ? "is-invalid" : "" } className={ "mb-3" } Icon={ "key" }
								  InputType={ "password" } Name={ "password" } Placeholder={ "Passwort" }/>

				<div className="row">
					<div className="col-6">
						<CLTECheckbox OnValueChanges={ setStayLoggedIn } Checked={ StayLoggedIn }>Eingeloggt
							bleiben</CLTECheckbox>
					</div>
					<div className="col-6">
						<button type="submit" className="btn btn-primary btn-block rounded-0">
							<FontAwesomeIcon icon={ "sign-in" } className={ "pe-2" }/>
							Einloggen
						</button>
					</div>
				</div>
			</form>
		</>
	);
}