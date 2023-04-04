import React, {
	Suspense,
	useEffect,
	useState
}                          from 'react';
import ReactDOM            from 'react-dom/client';
import reportWebVitals     from './reportWebVitals';

import 'icheck-bootstrap/icheck-bootstrap.min.css'
import "bootstrap/dist/css/bootstrap.min.css"
import "admin-lte/dist/css/adminlte.min.css"
import '@fortawesome/fontawesome-svg-core/styles.css'
import './Css/App.css'
import { API_AuthLib }     from "./Lib/Api/API_Auth.Lib";
import { BrowserRouter }   from "react-router-dom";
import { Modal }           from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAuth             from "./Hooks/useAuth";
import AccountContext      from './Context/AccountContext';

const PreLoginApp = React.lazy( () => import("./PreLoginApp") );
const MainApp = React.lazy( () => import("./MainApp") );

const root = ReactDOM.createRoot(
	document.getElementById( 'root' ) as HTMLElement
);

function IndexApp() {
	const { User, SetToken, Token } = useAuth();
	const [ WasChecked, setWasChecked ] = useState( false );

	console.log( Token )

	useEffect( () => {
		const Check = async() => {
			const Result = await API_AuthLib.IsLoggedIn();

			if ( !User.IsLoggedIn() && Token !== "" ) {
				//Logout();
			}

			if ( Result.Reached ) {
				if ( !Result.Auth && Token !== "" ) {
					//Logout();
				}

				if ( Result.Data && Result.Data.JsonWebToken !== Token ) {
					SetToken( Result.Data.JsonWebToken );
				}

				if ( !WasChecked ) {
					clearInterval( Timer );
					Timer = setInterval( Check, 60000 );
					setWasChecked( true );
				}
				return;
			}
			else {
				clearInterval( Timer );
				Timer = setInterval( Check, 1000 );
				setWasChecked( false );
			}

			if ( !( window.location.pathname.includes( "/signin" ) || window.location.pathname.includes( "/signup" ) ) ) {
				window.location.href = "/signin";
			}
			return;
		};

		let Timer = setInterval( Check, 1000 );
		Check();

		return () => {
			clearInterval( Timer );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] )

	if ( !WasChecked ) {
		return (
			<Modal show={ true } size={ "xl" } centered>
				<Modal.Body style={ { paddingTop: 150, paddingBottom: 150 } }>
					<center>
						<p style={ { fontSize: 100 } }><FontAwesomeIcon icon={ "spinner" } spin={ true }/></p>
						<p style={ { fontSize: 35 } }> Verbindung zur API wird aufgebaut...</p>
					</center>
				</Modal.Body>
			</Modal>
		)
	}

	return (
		<>
			<AccountContext.Provider value={ {
				Account: User
			} }>
				<Suspense fallback={ <></> }>
					{ ( WasChecked && !User.IsLoggedIn() ) ?
						<PreLoginApp/> :
						<MainApp/>
					}
				</Suspense>
			</AccountContext.Provider>
		</>
	);
}

root.render(
	<BrowserRouter>
		<IndexApp/>
	</BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals( console.log );
