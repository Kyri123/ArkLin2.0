/** @format */

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	Suspense,
	useContext
}                          from "react";
import {
	Col,
	Modal,
	Row
}                          from "react-bootstrap";
import {
	Route,
	Routes
}                          from "react-router";
import {
	Link,
	Navigate,
	useLocation
}                          from "react-router-dom";
import { LTERibbon }       from "./Components/Elements/AdminLTE/AdminLTE";
import AccountContext      from "./Context/AccountContext";
import PSignIn             from "./Pages/PreLogin/PSignIn";
import PSignUp             from "./Pages/PreLogin/PSignUp";

function PreLoginApp() {
	const Location = useLocation();
	const Account = useContext( AccountContext );
	const IsLogin = Location.pathname.includes( "signin" );

	if ( Account.Account.IsLoggedIn() ) {
		window.location.href = "/home";
		return <></>;
	}

	return (
		<div
			className="register-page bg-image"
			style={ {
				backgroundImage: "url('/img/backgrounds/bg.jpg')",
				backgroundSize: "cover",
				backgroundColor: "rgba(11, 19, 26, 1)",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
				height: "100%",
				width: "100%"
			} }
		>
			<Suspense fallback={ <></> }>
				<Modal
					onHide={ () => {
					} }
					show={ true }
					centered
					backdrop={ false }
					contentClassName={ "rounded-4" }
				>
					<Modal.Header className={ "p-3 pb-2 border-bottom-0" }>
						<h1 className="fw-bold mb-0 fs-2 p-2 text-center w-100">
							KAdmin ArkLin 2.0
						</h1>
						<LTERibbon>Alpha</LTERibbon>
					</Modal.Header>
					<Modal.Body className={ "p-3 pt-0" }>
						<Routes>
							<Route path="/signin" element={ <PSignIn/> }/>
							<Route path="/signup" element={ <PSignUp/> }/>
							<Route path={ "*" } element={ <Navigate replace to="/signin"/> }/>
						</Routes>
						<hr className="my-4"/>
						<Row>
							<Col span={ 6 }>
								<Link
									to="https://discord.gg/uXxsqXD"
									target="_blank"
									className={ "btn btn-dark w-100 mb-2 rounded-3" }
								>
									<FontAwesomeIcon
										icon={ [ "fab", "discord" ] }
										className={ "pe-2" }
									/>
									Discord
								</Link>
							</Col>
							<Col span={ 6 }>
								<Link
									to="https://github.com/Kyri123/ArkLin2.0/"
									target="_blank"
									className={ "btn btn-dark w-100 mb-2 rounded-3" }
								>
									<FontAwesomeIcon
										icon={ [ "fab", "github" ] }
										className={ "pe-2" }
									/>
									Github
								</Link>
							</Col>
						</Row>
						<Link
							to={ IsLogin ? "/signup" : "/signin" }
							className="w-100 py-2 mb-2 mt-2 btn btn-primary rounded-3"
						>
							{ IsLogin ? "Account Erstellen" : "Einloggen" }
						</Link>
					</Modal.Body>
				</Modal>
			</Suspense>
		</div>
	);
}

export default PreLoginApp;
