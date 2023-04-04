import { Link }            from "react-router-dom";
import { LTERibbon }       from "../AdminLTE/AdminLTE";
import { LTENavLink }      from "../AdminLTE/AdminLTE_Nav";
import { EPerm }           from "../../../Shared/Enum/User.Enum";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function CLeftNavigation() {
	return (
		<aside className="main-sidebar sidebar-bg-dark sidebar-color-primary shadow">
			<Link to="/home" className="brand-link">
				<img src="/img/logo/logo.png" alt="AdminLTE Logo" className="brand-image" style={ { opacity: 0.8 } }/>
				<span className="brand-text font-weight-light ps-0">ArkLIN2</span>
				<LTERibbon>
					Alpha
				</LTERibbon>
			</Link>

			<div className="brand-container">
				<Link to="/home" className="brand-link">
					<img src="/img/logo/logo.png" alt="AdminLTE Logo" className="brand-image"
						 style={ { opacity: 0.8 } }/>
					<span className="brand-text font-weight-light ps-0">ArkLIN2</span>
				</Link>
				<LTERibbon>
					Alpha
				</LTERibbon>
			</div>

			<div className="sidebar">
				<nav className="mt-2">
					<ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu"
						data-accordion="false">
						<li className="nav-header">ARKLIN 2</li>
						<LTENavLink Icon="tachometer-alt" To="/home">
							Startseite
						</LTENavLink>

						<LTENavLink Permission={ EPerm.Super } Icon="users" To="/users">
							Benutzer
						</LTENavLink>

						<LTENavLink Permission={ EPerm.Super } Icon="server" To="/adminserver">
							Server
						</LTENavLink>

						<LTENavLink Permission={ EPerm.Super } Icon="network-wired" To="/cluster" Hide>
							Cluster
						</LTENavLink>
					</ul>
				</nav>
				<div className="sidebar-custom pb-3">
					<hr/>
					<div className={ "ps-2 pe-2" }>
						<Link target="_blank" to="https://discord.gg/uXxsqXD" className="btn btn-link"><FontAwesomeIcon
							icon={ [ "fab", "discord" ] }/></Link>
						<Link target="_blank" to="https://github.com/Kyri123/ArkLin2.0/"
							  className="btn btn-link"><FontAwesomeIcon icon={ [ "fab", "github" ] }/></Link>
						<Link target="_blank" to="https://app.clickup.com/30351857/v/l/s/90060096400"
							  className="btn btn-link"><FontAwesomeIcon icon={ "clipboard-list" }/></Link>
						<Link target="_blank"
							  to="https://www.paypal.com/cgi-bin/webscr?shell=_s-xclick&amp;hosted_button_id=68PT9KPRABVCU&amp;source=url"
							  className="btn btn-link"><FontAwesomeIcon icon={ "donate" }/></Link>
						<Link target="_blank" to="https://github.com/Kyri123/ArkLin2.0/issues"
							  className="btn btn-secondary hide-on-collapse pos-right"><FontAwesomeIcon
							icon={ "bug" }/></Link>
					</div>
				</div>
			</div>
		</aside>
	);
}