import {
	FormEvent,
	useState
}                               from "react";
import { IAPIResponseBase }     from "../../Types/API";
import { CAlert }               from "../../Components/Elements/CAlert";
import { FontAwesomeIcon }      from "@fortawesome/react-fontawesome";
import { API_AuthLib }          from "../../Lib/Api/API_Auth.Lib";
import { IAccountInformations } from "../../Shared/Type/User";
import { LTEInputWithIcon }     from "../../Components/Elements/AdminLTE/AdminLTE";
import useAuth                  from "../../Hooks/useAuth";

export default function PSignUp() {
	const { SetToken } = useAuth();
	const [ InputState, setInputState ] = useState<boolean[]>( [] );
	const [ Response, setResponse ] = useState<IAPIResponseBase<IAccountInformations> | undefined>();

	const OnSubmit = async( Event : FormEvent<HTMLFormElement> ) => {
		Event.preventDefault();

		let Resp : IAPIResponseBase<IAccountInformations> | undefined = undefined;

		const target = Event.target as typeof Event.target & {
			user : { value : string };
			email : { value : string };
			password : { value : string };
			passwordagain : { value : string };
			accountkey : { value : string };
		};

		setInputState( [
			target.user.value.length < 6,
			!( /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test( target.email.value ) ),
			target.password.value.length < 7,
			target.passwordagain.value !== target.password.value || target.passwordagain.value.length < 7,
			target.accountkey.value.length < 10
		] );

		if ( !InputState.find( e => e ) ) {
			Resp = await API_AuthLib.TryCreateAnAccount( {
				user: target.user.value,
				accountkey: target.accountkey.value,
				password: target.password.value,
				passwordagain: target.passwordagain.value,
				email: target.email.value
			} );

			if ( Resp ) {
				if ( Resp.Auth && Resp.Data ) {
					SetToken( Resp.Data.JsonWebToken );
					window.location.href = "/home";
				}
			}
		}

		setResponse( Resp );
	}

	return (
		<>
			<CAlert OnClear={ () => {
				if ( Response ) {
					const Copy : IAPIResponseBase | undefined = structuredClone( Response );
					if ( Copy ) {
						Copy.Message = undefined;
						setResponse( Copy );
					}
				}
			} } Data={ Response }/>

			<form action="#" method="post" onSubmit={ OnSubmit }>
				<LTEInputWithIcon Outline={ InputState[ 0 ] ? "is-invalid" : "" } className={ "mb-3" } Icon={ "user" }
								  InputType={ "text" } Name={ "user" } Placeholder={ "Benutzername" }/>
				<LTEInputWithIcon Outline={ InputState[ 1 ] ? "is-invalid" : "" } className={ "mb-3" }
								  Icon={ "envelope" } InputType={ "email" } Name={ "email" } Placeholder={ "E-Mail" }/>
				<LTEInputWithIcon Outline={ InputState[ 2 ] ? "is-invalid" : "" } className={ "mb-3" } Icon={ "key" }
								  InputType={ "password" } Name={ "password" } Placeholder={ "Passwort" }/>
				<LTEInputWithIcon Outline={ InputState[ 3 ] ? "is-invalid" : "" } className={ "mb-3" } Icon={ "key" }
								  InputType={ "password" } Name={ "passwordagain" }
								  Placeholder={ "Passwort wiederholen" }/>
				<LTEInputWithIcon Outline={ InputState[ 4 ] ? "is-invalid" : "" } className={ "mb-3" } Icon={ "lock" }
								  InputType={ "text" } Name={ "accountkey" } Placeholder={ "Account Schlüssel" }/>

				<div className="row">
					<div className="col-12">
						<button type="submit" className="btn btn-primary btn-block rounded-0">
							<FontAwesomeIcon icon={ "sign-in" } className={ "pe-2" }/>
							Account Erstellen (und Einloggen)
						</button>
					</div>
				</div>
			</form>
		</>
	);
}