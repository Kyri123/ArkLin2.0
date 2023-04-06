import {
	Link,
	Navigate,
	useLocation
}                          from "react-router-dom";
import React, { Suspense } from "react";
import { Card }            from "react-bootstrap";
import {
	Route,
	Routes
}                          from "react-router";
import StringMapLib        from "../../Lib/StringMap.Lib";

const SPUser = React.lazy( () => import("./Subpage/me/SPUser") );

export default function PUsersettings() {
	const Location = useLocation();

	return (
		<Card>
			<Card.Header className="d-flex p-0">
				<h3 className="card-title p-3">
					{ StringMapLib.SubNav( Location.pathname.split( "/" ).pop() as string ) }
				</h3>
				<ul className="nav nav-pills ml-auto p-2">
					<li className="nav-item">
						<Link
							to="/me/benutzer"
							className={ `nav-link ${
								Location.pathname.toLowerCase() === "/me/benutzer"
									? "active"
									: ""
							}` }
						>
							{ StringMapLib.SubNav( "benutzer" ) }
						</Link>
					</li>
				</ul>
			</Card.Header>
			<Suspense fallback={ <></> }>
				<Routes>
					<Route path={ "/benutzer" } element={ <SPUser/> }/>
					<Route path={ "*" } element={ <Navigate to={ "/me/benutzer" }/> }/>
				</Routes>
			</Suspense>
		</Card>
	);
}
