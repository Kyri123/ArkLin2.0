import useAccount from "@hooks/useAccount";
import { EPerm } from "@shared/Enum/User.Enum";
import type {
	FunctionComponent,
	PropsWithChildren
} from "react";
import { Nav } from "react-bootstrap";
import { BiHome } from "react-icons/all";
import {
	BsHddNetwork,
	BsPeople,
	BsServer
} from "react-icons/bs";
import type { IconType } from "react-icons/lib";
import {
	Link,
	useLocation
} from "react-router-dom";


export interface LeftNavigationProps extends PropsWithChildren {
	to: string,
	Icon: IconType
}

export const NavItemLink: FunctionComponent<LeftNavigationProps> = ( { Icon, to, children } ) => {
	const { pathname } = useLocation();
	return (
		<Link to={ to }
			className={ pathname.endsWith( to ) ? "text-neutral-200 no-underline text-lg p-3 py-2 bg-neutral-700" : "text-neutral-200 no-underline text-lg p-3 py-2 hover:bg-neutral-900 " }>
			<Icon size={ 17 } className="me-2 mb-1" />
			{ children }
		</Link>
	);
};


export default function LeftNavigation() {
	const { user } = useAccount();

	return (
		<div id="Sidebar"
			className="d-flex flex-column flex-shrink-0 p-3 text-bg-dark d-none d-md-block px-0"
			style={ { width: 280 } }>
			<Link to="/app"
				className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none px-3">
				<img alt="logo"
					src="/img/logo/logo.png"
					className="pe-none me-2"
					width={ 40 } />
				<span className="fs-4">ArkLin 2.0</span>
			</Link>
			<hr />
			<Nav as="ul" variant="pills" className="mb-auto flex-column nav-pills">
				<NavItemLink Icon={ BiHome } to="/app">
					Startseite
				</NavItemLink>
				<Nav.Item as="li" className="">

				</Nav.Item>

				{ user.hasPermission( EPerm.ManageCluster ) && (
					<NavItemLink Icon={ BsHddNetwork } to="/app/cluster">
						Cluster
					</NavItemLink>
				) }

				{ user.hasPermission( EPerm.Super ) && (
					<NavItemLink Icon={ BsPeople } to="/app/usermanagement">
						Benutzer
					</NavItemLink>
				) }

				{ user.hasPermission( EPerm.Super ) && (
					<NavItemLink Icon={ BsServer } to="/app/adminserver">
						Server
					</NavItemLink>
				) }
			</Nav>
		</div>
	);
}
