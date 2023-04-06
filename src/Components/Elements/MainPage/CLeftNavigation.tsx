import { useContext } from "react";
import { Nav }        from "react-bootstrap";
import {
	BsHouseDoor,
	BsPeople,
	BsServer
}                     from "react-icons/bs";
import {
	Link,
	useLocation
}                     from "react-router-dom";
import AccountContext from "../../../Context/AccountContext";
import { EPerm }      from "../../../Shared/Enum/User.Enum";

export default function CLeftNavigation() {
	const { pathname } = useLocation();
	const { Account } = useContext( AccountContext );

	return (
		<div
			id={ "Sidebar" }
			className="d-flex flex-column flex-shrink-0 p-3 text-bg-dark d-none d-md-block"
			style={ { width: 280 } }
		>
			<Link
				to="/home"
				className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
			>
				<img
					alt="logo"
					src="/img/logo/logo.png"
					className="pe-none me-2"
					width={ 40 }
				/>
				<span className="fs-4">Sidebar</span>
			</Link>
			<hr/>
			<Nav as="ul" variant="pills" className={ "mb-auto flex-column nav-pills" }>
				<Nav.Item as="li" className="">
					<Link
						to="/home"
						className={ `nav-link ${
							pathname.endsWith( "/home" ) ? "active" : ""
						} text-white` }>
						<BsHouseDoor size={ 17 } className={ "me-1" }/>
						Startseite
					</Link>
				</Nav.Item>

				{ Account.HasPermission( EPerm.Super ) && (
					<Nav.Item as="li" className="mt-2">
						<Link
							to="/users"
							className={ `nav-link ${
								pathname.endsWith( "/users" ) ? "active" : ""
							} text-white` }>
							<BsPeople size={ 17 } className={ "me-1" }/>
							Benutzer
						</Link>
					</Nav.Item>
				) }

				{ Account.HasPermission( EPerm.Super ) && (
					<Nav.Item as="li" className="mt-2">
						<Link
							to="/adminserver"
							className={ `nav-link ${
								pathname.endsWith( "/adminserver" ) ? "active" : ""
							} text-white` }
						>
							<BsServer size={ 17 } className={ "me-1" }/>
							Server
						</Link>
					</Nav.Item>
				) }
			</Nav>
		</div>
	);
}
