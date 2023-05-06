import { FontAwesomeIcon }  from "@fortawesome/react-fontawesome";
import {
	useContext,
	useId
}                           from "react";
import { Dropdown }         from "react-bootstrap";
import * as Icon            from "react-icons/bs";
import { Link }             from "react-router-dom";
import ServerContext        from "@context/ServerContext";
import useAuth              from "@hooks/useAuth";
import { EPerm }            from "@shared/Enum/User.Enum";
import CServerCard          from "@page/MainApp/PageComponents/Server/ServerCard";
import useAccount           from "@hooks/useAccount";
import type { SystemUsage } from "@server/MongoDB/DB_Usage";
import {
	fireSwalFromApi,
	tRPC_Auth
}                           from "@app/Lib/tRPC";

export default function TopNavigation( Props : {
	SystemUsage : SystemUsage;
	ServerState : [ number, number ];
	ShowLog : ( Value : boolean ) => void;
} ) {
	const ID = useId();
	const { InstanceData } = useContext( ServerContext );
	const { Logout } = useAuth();
	const { user } = useAccount();

	const ToggleSidebar = () => {
		const Sidebar = window.document.getElementById( "Sidebar" );
		if ( Sidebar && Sidebar.classList.contains( "d-none" ) ) {
			Sidebar.classList.remove( "d-none" );
			Sidebar.classList.add( "show" );
		}
		else if ( Sidebar ) {
			Sidebar.classList.add( "d-none" );
			Sidebar.classList.remove( "show" );
		}
	};

	const restartPanel = async() => {
		const accept = await fireSwalFromApi( "Möchtest du wirklich das Panel neustarten?", "question", {
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Ja",
			cancelButtonText: "Nein",
			timer: 5000
		} );

		if ( accept?.isConfirmed ) {
			const result = await tRPC_Auth.panelAdmin.restart.mutate();
			if ( result ) {
				fireSwalFromApi( result, true );
			}
		}
	};


	const updatePanel = async() => {
		const accept = await fireSwalFromApi( "Möchtest du wirklich das Panel updaten?", "question", {
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Ja",
			cancelButtonText: "Nein",
			timer: 5000
		} );

		if ( accept?.isConfirmed ) {
			const result = await tRPC_Auth.panelAdmin.update.mutate();
			if ( result ) {
				fireSwalFromApi( result, true );
			}
		}
	};

	return (
		<>
			<div className="container-fluid bg-gray-200 p-2 border-bottom">
				<div
					className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start p-2">
					<div className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
						<Link onClick={ ToggleSidebar }
						      to="#"
						      className="d-block d-md-none link-dark text-decoration-none me-3"
						>
							<FontAwesomeIcon icon={ "bars" } className={ "me-2" }/>
							Navigation
						</Link>
						{ user.HasPermission( EPerm.PanelSettings ) && (
							<div className="dropdown text-end ms-2">
								<Link
									to="#"
									className="d-block link-dark text-decoration-none dropdown-toggle"
									data-bs-toggle="dropdown"
									aria-expanded="false"
								>
									<Icon.BsWindowDesktop className={ "me-2" }/>
									Dashboard { ( Props.SystemUsage.PanelNeedUpdate ) &&
									<span className="text-green-700">Update verfügbar!</span> }
								</Link>

								<div className="dropdown-menu dropdown-menu-lg dropdown-menu-left">
									{ ( Props.SystemUsage.PanelNeedUpdate ) && (
										<>
											<button
												onClick={ updatePanel }
												className="dropdown-item text-info"
											>
												<Icon.BsDownload className={ "pe-2" } size={ 22 }/>
												<b>{ Props.SystemUsage.NextPanelBuildVersion }</b>
												Update Installieren
											</button>
											<div className="dropdown-divider"></div>
										</>
									) }
									<button
										onClick={ () => Props.ShowLog( true ) }
										className="dropdown-item"
										data-toggle="modal"
										data-target="#panelControlerLogs"
									>
										<Icon.BsClipboard className={ "pe-2" } size={ 22 }/>
										Panel Log
									</button>
									{ user.HasPermission( EPerm.PanelSettings ) && (
										<Link
											to="/app/paneladmin"
											className="dropdown-item"
											data-toggle="modal"
											data-target="#panelControlerLogs"
										>
											<FontAwesomeIcon icon={ "cogs" } className={ "pe-2" }/>
											Panel Einstellungen
										</Link>
									) }
									<button
										onClick={ restartPanel }
										className="dropdown-item text-bg-danger"
										data-toggle="modal"
										data-target="#panelControlerLogs"
									>
										<FontAwesomeIcon icon={ "refresh" } className={ "pe-2" }/>
										Panel Neustarten
									</button>
								</div>
							</div>
						) }
					</div>

					<div className="dropdown text-end">
						<Link
							to="#"
							className="d-block link-dark text-decoration-none dropdown-toggle"
							data-bs-toggle="dropdown"
							aria-expanded="false"
						>
							<Icon.BsServer className={ "me-2" }/>
							<>
								Server { Props.ServerState[ 0 ] } /{ " " }
								<span className="text-danger">{ Props.ServerState[ 1 ] }</span>
							</>
						</Link>
						<ul className="dropdown-menu text-small p-0">
							<Dropdown.Item className="dropdown-item dropdown-footer pt-2 pb-2">
								Aktive Server
							</Dropdown.Item>

							{ Object.keys( InstanceData ).map( ( Instance ) => (
								<CServerCard InstanceName={ Instance } key={ ID + Instance }/>
							) ) }
							<Dropdown.Divider className={ "m-0" }/>
							<Dropdown.Item
								as={ Link }
								to="/adminserver"
								className="dropdown-item dropdown-footer pt-2 pb-2"
							>
								Server Hinzufügen
							</Dropdown.Item>
						</ul>
					</div>

					<div className="dropdown text-end ms-3 me-2">
						<Link
							to="#"
							className="d-block link-dark text-decoration-none dropdown-toggle"
							data-bs-toggle="dropdown"
							aria-expanded="false"
						>
							<Icon.BsPeople className={ "me-2" }/>
							{ user.Get.username }
						</Link>
						<div
							className="dropdown-menu flex-column flex-lg-row align-items-stretch justify-content-start p-3 rounded-3 shadow-lg"
							data-bs-theme="light"
							style={ { minWidth: 300 } }
						>
							<ul className="list-unstyled d-flex flex-column gap-2 m-0">
								<li>
									<Link
										to="/app/me"
										className="btn btn-hover-light rounded-2 d-flex align-items-start gap-2 py-2 px-3 lh-sm text-start"
									>
										<div>
											<strong className="d-block">Account Einstellungen</strong>
											<small>Ändere dein Zugangsdaten</small>
										</div>
									</Link>
									<Link
										to="#"
										onClick={ Logout }
										className="btn btn-hover-light rounded-2 d-flex align-items-start gap-2 py-2 px-3 lh-sm text-start"
									>
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
		</>
	);
}
