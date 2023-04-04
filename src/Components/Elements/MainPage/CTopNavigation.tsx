import { Link }            from "react-router-dom";
import { EPerm }           from "../../../Shared/Enum/User.Enum";
import {
	useContext,
	useId
}                          from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ISystemUsage }    from "../../../Shared/Type/Systeminformation";
import { API_PanelLib }    from "../../../Lib/Api/API_Panel.Lib";
import useAuth             from "../../../Hooks/useAuth";
import AccountContext      from "../../../Context/AccountContext";
import ServerContext       from "../../../Context/ServerContext";
import CServerCard         from "../Server/ServerCard";

export default function CTopNavigation( Props : {
	SystemUsage : ISystemUsage;
	ServerState : [ number, number ];
	ShowLog : ( Value : boolean ) => void;
} ) {
	const ID = useId();
	const { InstanceData } = useContext( ServerContext );
	const { Logout } = useAuth();
	const { Account } = useContext( AccountContext );

	return (
		<nav className="main-header navbar navbar-expand navbar-light">
			<div className="container-fluid">
				{ Account.HasPermission( EPerm.ManagePanel ) &&
					<ul className="navbar-nav">
						<li className="nav-item">
							<span className="nav-link" data-widget="pushmenu" role="button">
								<i className="fas fa-bars"></i>
							</span>
						</li>

						<div className="d-sm-inline-block"></div>

						<li className="nav-item dropdown" id="panelControler" style={ { cursor: "pointer" } }>
							<span className="nav-link" data-toggle="dropdown">
								<FontAwesomeIcon icon={ "desktop" } size={ "lg" } className={ "pe-1" }/> Panel
								{ ( Props.SystemUsage.PanelNeedUpdate ) &&
									<span className="bg-success rounded ml-2 p-2">Update verfügbar!</span>
								}
							</span>
							<div className="dropdown-menu dropdown-menu-lg dropdown-menu-left">
								{ ( Props.SystemUsage.PanelNeedUpdate ) &&
									<>
										<button onClick={ () => {
										} } className="dropdown-item text-info">
											<FontAwesomeIcon icon={ "download" } className="me-2"/>
											<b>{ Props.SystemUsage.NextPanelBuildVersion }</b> Installieren
										</button>
										<div className="dropdown-divider"></div>
									</>
								}
								<button onClick={ () => Props.ShowLog( true ) } className="dropdown-item"
										data-toggle="modal" data-target="#panelControlerLogs">
									<FontAwesomeIcon icon={ "clipboard" } className="me-2"/>
									Panel Log
								</button>
								{ Account.HasPermission( EPerm.PanelSettings ) &&
									<Link to="/paneladmin" className="dropdown-item" data-toggle="modal"
										  data-target="#panelControlerLogs">
										<FontAwesomeIcon icon={ "cogs" } className="me-2"/>
										Panel Einstellungen
									</Link>
								}
								<button onClick={ () => API_PanelLib.Restart() }
										className="dropdown-item text-bg-danger"
										data-toggle="modal" data-target="#panelControlerLogs">
									<FontAwesomeIcon icon={ "refresh" } className="me-2"/>
									Panel Neustarten
								</button>
							</div>
						</li>
					</ul>
				}

				<div className="navbar-custom-menu ml-auto">
					<ul className="nav navbar-nav">
						<li className="nav-item dropdown">
							<span className="nav-link show" data-bs-toggle="dropdown" aria-expanded="true">
								<FontAwesomeIcon icon={ "server" } size={ "lg" } className={ "pe-2" }/>
								<span className="text-success">{ Props.ServerState[ 0 ] }</span> / <span
								className="text-danger">{ Props.ServerState[ 1 ] }</span>
							</span>
							<div className="dropdown-menu dropdown-menu-lg dropdown-menu-end"
								 data-bs-popper="static">
								{ Object.keys( InstanceData ).map( Instance => (
									<CServerCard InstanceName={ Instance } key={ ID + Instance }/>
								) ) }
								<div className="dropdown-divider"></div>
								<Link to="/adminserver" className="dropdown-item dropdown-footer text-bg-success">Server
									Hinzufügen</Link>
							</div>
						</li>

						<li className="dropdown user user-menu open">
							<span className="nav-link dropdown-toggle" data-toggle="dropdown"
								  aria-expanded="true">
								<img src="/img/logo/logo.png" className="user-image border-0 rounded-0"
									 alt="User"/>
								<span
									className="d-none d-sm-inline">{ Account.GetDBInformation().username }</span>
							</span>
							<ul className="dropdown-menu dropdown-menu-right">
								<li className="user-header">
									<img src="/img/logo/logo.png" className="border-0" style={ { borderWidth: 3 } }
										 alt="User"/>
									<p>
										Willkommen <b>{ Account.GetDBInformation().username }</b>
									</p>
								</li>
								<li className="user-footer">
									<Link to="/me" className="btn btn-default btn-flat">Einstellungen</Link>
									<button onClick={ Logout }
											className="btn btn-danger float-end">Ausloggen
									</button>
								</li>
							</ul>
						</li>
					</ul>
				</div>
			</div>
		</nav>
	);
}