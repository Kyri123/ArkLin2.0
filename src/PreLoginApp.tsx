import React, {
	Suspense,
	useContext
}                          from 'react';
import {
	Link,
	Navigate,
	useLocation
}                          from "react-router-dom";
import {
	Route,
	Routes
}                          from 'react-router';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LTERibbon }       from "./Components/Elements/AdminLTE/AdminLTE";
import AccountContext      from "./Context/AccountContext";

const PSignIn = React.lazy( () => import("./Pages/PreLogin/PSignIn") );
const PSignUp = React.lazy( () => import("./Pages/PreLogin/PSignUp") );

function PreLoginApp() {
	const Location = useLocation();
	const Account = useContext( AccountContext );

	if ( Account.Account.IsLoggedIn() ) {
		window.location.href = "/home";
		return <></>;
	}

	return (
		<main className="register-page bg-image" style={ {
			backgroundImage: "url('/img/backgrounds/bg.jpg')",
			backgroundSize: "cover",
			backgroundColor: "rgba(11, 19, 26, 1)",
			backgroundPosition: "center",
			backgroundRepeat: "no-repeat"
		} }>
			<Suspense fallback={ <></> }>
				<div className="register-box">
					<div className="card register-logo bg-white border border-dark mb-2" style={ { height: 60 } }>
						<div className="d-flex justify-content-start social_icon ps-2">
							<a href="https://discord.gg/uXxsqXD" className="pe-1 ps-1 pt-1" rel="noopener"
							   style={ { fontSize: 30 } }>
								<FontAwesomeIcon icon={ [ "fab", "discord" ] }/>
							</a>
							<a href="https://git.kyrium.space/arktools/KAdmin-ArkLIN2" className="ps-1 pt-1"
							   rel="noopener" style={ { fontSize: 30 } }>
								<FontAwesomeIcon icon={ [ "fab", "gitlab-square" ] }/>
							</a>
							<span className="ps-5">
									<b>ArkLIN2</b>
								</span>
						</div>
						<LTERibbon>
							Alpha
						</LTERibbon>
					</div>

					<div className="card border border-dark">
						<div className="card-body register-card-body">
							<Routes>
								<Route path="/signin" element={ <PSignIn/> }/>
								<Route path="/signup" element={ <PSignUp/> }/>
								<Route path={ "*" } element={ <Navigate replace to="/signin"/> }/>
							</Routes>
						</div>

						<p className="p-0 m-0">
							<Link to={ Location.pathname.includes( "/signin" ) ? "/signup" : "/signin" }
								  className="text-center btn btn-sm btn-dark" style={ { width: "100%" } }>
								{ Location.pathname.includes( "/signin" ) ? "Account Erstellen" : "Einloggen" }
							</Link>
						</p>
					</div>
				</div>
			</Suspense>
		</main>
	);
}

export default PreLoginApp;
