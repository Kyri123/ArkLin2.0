import { useArkServer }    from "../../Hooks/useArkServer";
import {
	Link,
	Navigate,
	useLocation,
	useParams
}                          from "react-router-dom";
import React, {
	Suspense,
	useContext,
	useEffect,
	useState
}                          from "react";
import {
	Col,
	Nav,
	Navbar,
	Row
}                          from "react-bootstrap";
import {
	Route,
	Routes
}                          from "react-router";
import CServerHead         from "../../Components/Elements/Server/ServerHead";
import SPServerConfig      from "./Subpage/server/SPServerConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ServerContext       from "../../Context/ServerContext";
import AccountContext      from "../../Context/AccountContext";
import SPServerMods        from "./Subpage/server/SPServerMods";

const SPServerLogs = React.lazy( () => import("./Subpage/server/SPServerLogs") );

export default function PServer() {
	const { HasData } = useContext( ServerContext );
	const Account = useContext( AccountContext );
	const Location = useLocation();
	const { InstanceName } = useParams();
	const Server = useArkServer( InstanceName as string );
	const [ Instance, setInstance ] = useState<string>( InstanceName || "" );

	useEffect( () => {
		setInstance( InstanceName || "" );
	}, [ Location.pathname, InstanceName ] );

	if ( !HasData ) {
		return <></>;
	}

	if (
		!Server.IsValid() ||
		!Account.Account.HasPermissionForServer( InstanceName as string )
	) {
		return <Navigate to={ "/home/404" }/>;
	}

	return (
		<>
			<CServerHead InstanceName={ Instance }/>

			<Navbar
				collapseOnSelect
				expand="lg"
				bg="dark"
				variant="dark"
				className={ "mb-3" }
			>
				<Navbar.Toggle aria-controls="responsive-navbar-nav"/>
				<Navbar.Collapse id="responsive-navbar-nav">
					<Nav className="me-auto">
						<Nav.Link
							as={ Link }
							to={ `/server/${ InstanceName }/logs` }
							active={ Location.pathname.endsWith( "/logs" ) }
						>
							<FontAwesomeIcon className={ "icon" } icon={ "list" }/> Logs
						</Nav.Link>

						<Nav.Link
							as={ Link }
							to={ `/server/${ InstanceName }/konfiguration` }
							active={ Location.pathname.endsWith( "/konfiguration" ) }
						>
							<FontAwesomeIcon className={ "icon" } icon={ "cogs" }/> Konfiguration
						</Nav.Link>

						<Nav.Link
							as={ Link }
							to={ `/server/${ InstanceName }/mods` }
							active={ Location.pathname.endsWith( "/mods" ) }
						>
							<FontAwesomeIcon className={ "icon" } icon={ "star" }/> Mods
						</Nav.Link>
					</Nav>
				</Navbar.Collapse>
			</Navbar>

			<Row>
				<Col>
					<Suspense fallback={ <></> }>
						<Routes>
							<Route
								path={ `/logs` }
								element={ <SPServerLogs InstanceName={ Instance }/> }
							/>
							<Route
								path={ `/mods` }
								element={ <SPServerMods InstanceName={ Instance }/> }
							/>
							<Route
								path={ `/konfiguration` }
								element={ <SPServerConfig InstanceName={ Instance }/> }
							/>
							<Route
								path={ "*" }
								element={ <Navigate to={ `/server/${ InstanceName }/logs` }/> }
							/>
						</Routes>
					</Suspense>
				</Col>
			</Row>
		</>
	);
}
