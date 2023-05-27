import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ServerLayoutLoaderProps } from "@page/app/loader/server/Layout";
import CServerHead from "@page/app/pageComponents/server/ServerHead";
import type { FunctionComponent } from "react";
import {
	Col,
	Nav,
	Navbar,
	Row
} from "react-bootstrap";
import {
	Link,
	Outlet,
	useLoaderData,
	useLocation
} from "react-router-dom";


const Component: FunctionComponent = () => {
	const { pathname } = useLocation();
	const { instanceName } = useLoaderData() as ServerLayoutLoaderProps;

	const handleOnMouseEnter = ( Event: React.MouseEvent<HTMLDivElement, MouseEvent> ) => {
		Event.currentTarget.children[ 1 ]?.classList.toggle( "d-none", false );
	};

	const handleOnMouseLeave = ( Event: React.MouseEvent<HTMLDivElement, MouseEvent> ) => {
		Event.currentTarget.children[ 1 ]?.classList.toggle( "d-none", true );
	};

	return (
		<>
			<CServerHead instanceName={ instanceName } />

			<Navbar bg="dark"
				variant="dark"
				className="mb-3">
				<Nav className="me-auto ms-3">
					<Nav.Link as={ Link }
						to={ `/app/server/${ instanceName }/logs` }
						active={ pathname.endsWith( "/logs" ) }
						onMouseEnter={ handleOnMouseEnter }
						onMouseLeave={ handleOnMouseLeave }>
						<FontAwesomeIcon className="me-2" icon="list" />
						{ !pathname.endsWith( "/logs" ) ? <span className="d-none">Logs</span> : "Logs" }
					</Nav.Link>

					<Nav.Link as={ Link }
						to={ `/app/server/${ instanceName }/config` }
						active={ pathname.endsWith( "/config" ) }
						onMouseEnter={ handleOnMouseEnter }
						onMouseLeave={ handleOnMouseLeave }>
						<FontAwesomeIcon className="me-2" icon="cogs" />
						{ !pathname.endsWith( "/config" ) ?
							<span className="d-none">Konfiguration</span> : "Konfiguration" }
					</Nav.Link>

					<Nav.Link as={ Link }
						to={ `/app/server/${ instanceName }/mods` }
						active={ pathname.endsWith( "/mods" ) }
						onMouseEnter={ handleOnMouseEnter }
						onMouseLeave={ handleOnMouseLeave }>
						<FontAwesomeIcon className="me-2" icon="star" />
						{ !pathname.endsWith( "/mods" ) ?
							<span className="d-none">Modifikationen</span> : "Modifikationen" }
					</Nav.Link>
				</Nav>
			</Navbar>

			<Row>
				<Col>
					<Outlet />
				</Col>
			</Row>
		</>
	);
};

export { Component };

