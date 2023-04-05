import {
	useContext,
	useId
} from "react";
import { ISystemUsage } from "../../../Shared/Type/Systeminformation";
import useAuth from "../../../Hooks/useAuth";
import AccountContext from "../../../Context/AccountContext";
import ServerContext from "../../../Context/ServerContext";
import { Dropdown } from "react-bootstrap";
import CServerCard from "../Server/ServerCard";
import { Link } from "react-router-dom";
import * as Icon from "react-icons/bs";
import { API_PanelLib } from "../../../Lib/Api/API_Panel.Lib";
import { EPerm } from "../../../Shared/Enum/User.Enum";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function CTopNavigation(Props: {
	SystemUsage: ISystemUsage;
	ServerState: [number, number];
	ShowLog: (Value: boolean) => void;
}) {
	const ID = useId();
	const { InstanceData } = useContext(ServerContext);
	const { Logout } = useAuth();
	const { Account } = useContext(AccountContext);

	return (
		<>
			<div className="container-fluid bg-light p-2 border-bottom">
				<div
					className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start p-2">
					<div className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
						<div className="dropdown text-end ms-2">
							<Link to="#" className="d-block link-dark text-decoration-none dropdown-toggle"
								data-bs-toggle="dropdown" aria-expanded="false">
								<Icon.BsWindowDesktop className={ "me-2" } />
								Dashboard   
							</Link> 

							<div className="dropdown-menu dropdown-menu-lg dropdown-menu-left">
								{(Props.SystemUsage.PanelNeedUpdate) &&
									<>
										<button onClick={ () => {
										} } className="dropdown-item text-info">
											<Icon.BsDownload className={ "pe-2" } size={ 22 } />
											<b>{Props.SystemUsage.NextPanelBuildVersion}</b> Installieren
										</button>
										<div className="dropdown-divider"></div>
									</>
								}
								<button onClick={ () => Props.ShowLog( true) } className="dropdown-item"
									data-toggle="modal" data-target="#panelControlerLogs">
									<Icon.BsClipboard className={ "pe-2" } size={ 22 } />
									Panel Log
								</button>
								{Account.HasPermission(EPerm.PanelSettings) &&
									<Link to="/paneladmin" className="dropdown-item" data-toggle="modal"
										data-target="#panelControlerLogs">
										<FontAwesomeIcon icon={ "cogs" } className={ "pe-2" } />
										Panel Einstellungen
									</Link>
								}
								<button onClick={ () => API_PanelLib.Restart() }
									className="dropdown-item text-bg-danger"
									data-toggle="modal" data-target="#panelControlerLogs">
									<FontAwesomeIcon icon={ "refresh" } className={ "pe-2" } />
									Panel Neustarten
								</button>
							</div>
						</div>
					</div>

					<div className="dropdown text-end">
						<Link to="#" className="d-block link-dark text-decoration-none dropdown-toggle"
							data-bs-toggle="dropdown" aria-expanded="false">
							<Icon.BsServer className={ "me-2" } />
							<>
								Server {Props.ServerState[0]} / <span
									className="text-danger">{Props.ServerState[1]}</span>
							</>
						</Link>
						<ul className="dropdown-menu text-small p-0">
							<Dropdown.Item
								className="dropdown-item dropdown-footer pt-2 pb-2">Aktive Server
							</Dropdown.Item>

							{Object.keys(InstanceData).map(Instance => (
								<CServerCard InstanceName={ Instance } key={ ID + Instance } />
							))}
							<Dropdown.Divider className={ "m-0" } />
							<Dropdown.Item as={ Link } to="/adminserver"
								className="dropdown-item dropdown-footer pt-2 pb-2">Server
								Hinzufügen
							</Dropdown.Item>
						</ul>
					</div>

					<div className="dropdown text-end ms-3 me-2">
						<Link to="#" className="d-block link-dark text-decoration-none dropdown-toggle"
							data-bs-toggle="dropdown" aria-expanded="false">
							<Icon.BsPeople className={ "me-2" } />
							{Account.GetDBInformation().username}
						</Link>
						<div
							className="dropdown-menu flex-column flex-lg-row align-items-stretch justify-content-start p-3 rounded-3 shadow-lg"
							data-bs-theme="light" style={ { minWidth: 300 } }>
							<ul className="list-unstyled d-flex flex-column gap-2 m-0">
								<li>
									<Link to="/me"
										className="btn btn-hover-light rounded-2 d-flex align-items-start gap-2 py-2 px-3 lh-sm text-start">
										<div>
											<strong className="d-block">Account Einstellungen</strong>
											<small>Ändere dein Zugangsdaten</small>
										</div>
									</Link>
									<Link to="#" onClick={ Logout }
										className="btn btn-hover-light rounded-2 d-flex align-items-start gap-2 py-2 px-3 lh-sm text-start">
										<div className={ "text-danger" }>
											<strong className="d-block">Ausloggen</strong>
											<small>Möchtest du wirklich schon gehen? :(</small>
										</div>
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</>);
}