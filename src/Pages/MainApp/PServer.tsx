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
import CServerHead         from "./PageComponents/Server/ServerHead";
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


	const handleOnMouseEnter = ( Event : React.MouseEvent<HTMLDivElement, MouseEvent> ) => {
		Event.currentTarget.children[ 1 ]?.classList.toggle( "d-none", false );
	};

	const handleOnMouseLeave = ( Event : React.MouseEvent<HTMLDivElement, MouseEvent> ) => {
		Event.currentTarget.children[ 1 ]?.classList.toggle( "d-none", true );
	};

	return (
		<>
			<CServerHead InstanceName={ Instance }/>

			<Navbar
				bg="dark"
				variant="dark"
				className={ "mb-3" }
			>
				<Nav className="me-auto ms-3">
					<Nav.Link
						as={ Link }
						to={ `/server/${ InstanceName }/logs` }
						active={ Location.pathname.endsWith( "/logs" ) }
						onMouseEnter={ handleOnMouseEnter }
						onMouseLeave={ handleOnMouseLeave }
					>
						<FontAwesomeIcon className={ "me-2" } icon={ "list" }/>
						{ !Location.pathname.endsWith( "/logs" ) ? <span className="d-none">Logs</span> : "Logs" }
					</Nav.Link>

					<Nav.Link
						as={ Link }
						to={ `/server/${ InstanceName }/konfiguration` }
						active={ Location.pathname.endsWith( "/konfiguration" ) }
						onMouseEnter={ handleOnMouseEnter }
						onMouseLeave={ handleOnMouseLeave }
					>
						<FontAwesomeIcon className={ "me-2" } icon={ "cogs" }/>
						{ !Location.pathname.endsWith( "/konfiguration" ) ?
							<span className="d-none">Konfiguration</span> : "Konfiguration" }
					</Nav.Link>

					<Nav.Link
						as={ Link }
						to={ `/server/${ InstanceName }/mods` }
						active={ Location.pathname.endsWith( "/mods" ) }
						onMouseEnter={ handleOnMouseEnter }
						onMouseLeave={ handleOnMouseLeave }
					>
						<FontAwesomeIcon className={ "me-2" } icon={ "star" }/>
						{ !Location.pathname.endsWith( "/mods" ) ?
							<span className="d-none">Modifikationen</span> : "Modifikationen" }
					</Nav.Link>
				</Nav>
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
