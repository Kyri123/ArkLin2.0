import { Nav }    from "react-bootstrap";
import {
	BsHddNetwork,
	BsHouseDoor,
	BsPeople,
	BsServer
}                 from "react-icons/bs";
import {
	Link,
	useLocation
}                 from "react-router-dom";
import { EPerm }  from "@shared/Enum/User.Enum";
import useAccount from "@hooks/useAccount";

export default function LeftNavigation() {
	const { pathname } = useLocation();
	const { user } = useAccount();

	return (
		<div
			id={ "Sidebar" }
			className="d-flex flex-column flex-shrink-0 p-3 text-bg-dark d-none d-md-block"
			style={ { width: 280 } }
		>
			<Link
				to="/app"
				className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
			>
				<img
					alt="logo"
					src="/img/logo/logo.png"
					className="pe-none me-2"
					width={ 40 }
				/>
				<span className="fs-4">ArkLin 2.0</span>
			</Link>
			<hr/>
			<Nav as="ul" variant="pills" className={ "mb-auto flex-column nav-pills" }>
				<Nav.Item as="li" className="">
					<Link
						to="/app"
						className={ `nav-link ${
							pathname.endsWith( "/app" ) ? "active" : ""
						} text-white` }>
						<BsHouseDoor size={ 17 } className={ "me-1" }/>
						Startseite
					</Link>
				</Nav.Item>

				{ user.HasPermission( EPerm.ManageCluster ) && (
					<Nav.Item as="li" className="mt-2">
						<Link
							to="/app/cluster"
							className={ `nav-link ${
								pathname.endsWith( "/app/cluster" ) ? "active" : ""
							} text-white` }>
							<BsHddNetwork size={ 17 } className={ "me-1" }/>
							Cluster
						</Link>
					</Nav.Item>
				) }

				{ user.HasPermission( EPerm.Super ) && (
					<Nav.Item as="li" className="mt-2">
						<Link
							to="/app/usermanagement"
							className={ `nav-link ${
								pathname.endsWith( "/app/usermanagement" ) ? "active" : ""
							} text-white` }>
							<BsPeople size={ 17 } className={ "me-1" }/>
							Benutzer
						</Link>
					</Nav.Item>
				) }

				{ user.HasPermission( EPerm.Super ) && (
					<Nav.Item as="li" className="mt-2">
						<Link
							to="/app/adminserver"
							className={ `nav-link ${
								pathname.endsWith( "/app/adminserver" ) ? "active" : ""
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
