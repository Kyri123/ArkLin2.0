import { Link }                 from "react-router-dom";
import type { FC }              from "react";
import { useState }             from "react";
import { FontAwesomeIcon }      from "@fortawesome/react-fontawesome";
import {
	ServerStateToColor,
	ServerStateToReadableString
}                               from "@app/Lib/Conversion.Lib";
import { useArkServer }         from "@hooks/useArkServer";
import { ButtonGroup }          from "react-bootstrap";
import { IconButton }           from "@comp/Elements/Buttons";
import ServerAction             from "@comp/ServerAction";
import {
	fireSwalFromApi,
	onConfirm,
	tRPC_Auth,
	tRPC_handleError
}                               from "@app/Lib/tRPC";
import useAccount               from "@hooks/useAccount";
import type { ServerAdminCardProps } from "@page/app/pageComponents/adminServer/ServerAdminCard";

const ServerHead : FC<ServerAdminCardProps> = ( { InstanceName } ) => {
	const { user } = useAccount();
	const Server = useArkServer( InstanceName );
	const [ ShowModals, setShowModal ] = useState( false );
	const [ IsSending, setIsSending ] = useState( false );

	const cancelAction = async() => {
		setIsSending( true );
		const confirm = await onConfirm( "Möchtest du wirklich diese Aktion abbrechen?" );
		if ( confirm ) {
			const result = await tRPC_Auth.server.action.killAction.mutate( {
				instanceName: InstanceName,
				killServer: false
			} ).catch( tRPC_handleError );
			if ( result ) {
				fireSwalFromApi( result, true );
			}
		}
		setIsSending( false );
	};

	return (
		<>
			<div className="row">
				<div className="col-12 d-none">
					<h6 className="p-2 bg-dark text-center m-0 w-100">
						<span>CLUSTER</span> CLUSTERNAME
					</h6>
				</div>

				<div className="col-12 mb-3">
					<div className="card card-widget widget-user item-box m-0">
						<div
							className="widget-user-header rounded-0 text-white p-0"
							style={ {
								background: `url('${ Server.ServerMap.BG }') center right`
							} }
						>
							<div
								style={ {
									backgroundColor: "rgba(66,66,66,0.30)",
									height: "100%"
								} }
								className="p-3"
							>
								<h3 className="widget-user-username text-center text-light left">
									{ Server.Data.ark_SessionName }
								</h3>

								{ Server.State.IsListen ? (
									<h5 className="widget-user-desc text-center">
										<Link
											to={ `steam://connect/${ Server.Data.panel_publicip }:${ Server.Data.ark_QueryPort }` }
											className="text-light"
										>
											{ Server.Data.panel_publicip }:{ Server.Data.ark_QueryPort }
										</Link>
									</h5>
								) : (
									<h5 className="widget-user-desc text-center text-light">
										{ Server.Data.panel_publicip }:{ Server.Data.ark_QueryPort }
									</h5>
								) }
							</div>
							<div
								style={ { zIndex: 1000, height: 50 } }
								className={ "position-relative" }
							>
								<img
									src={ Server.ServerMap.LOGO }
									className="position-absolute top-100 start-50 translate-middle"
									style={ { height: 100, width: 100 } }
									alt={
										Server.Data.serverMap
									} /*style="border-top-width: 3px!important;height: 90px;width: 90px;background-color: #001f3f"*/
								/>
							</div>
						</div>
						<div className="card-footer p-0">
							<div className="row">
								<div className="col-12 col-md-3 pe-md-0">
									<div className="info-box mb-0 p-0 rounded-0 h-100">
										<div className="info-box-content pt-2 ps-3 text-center h-100 align-middle">
											<span className="description-text"> STATUS </span>
											<h6
												className={ `description-header text-${ ServerStateToColor(
													Server.State.State
												) }` }
											>
												{ " " }
												{ ServerStateToReadableString( Server.State.State ) }
											</h6>
										</div>
									</div>
								</div>
								<div className="col-12 col-md-3 p-md-0">
									<div className="info-box mb-0 p-0 rounded-0 h-100">
										<div className="info-box-content pt-2 ps-3 text-center h-100 align-middle">
											<span className="description-text">SPIELER</span>
											<h6 className="description-header">
												{ " " }
												{ Server.State.Player } / { Server.Data.ark_MaxPlayers }{ " " }
											</h6>
										</div>
									</div>
								</div>
								<div className="col-12 col-md-3 p-md-0">
									<div className="info-box mb-0 p-0 rounded-0 h-100">
										<div className="info-box-content pt-2 ps-3 text-center">
											<span className="description-text">AKTION</span>
											<h6 className="description-header text-success h-100 align-middle">
												<ButtonGroup>
													<IconButton
														disabled={
															!user.HasPermissionForServer(
																Server.InstanceName
															)
														}
														IsLoading={ Server.State.ArkmanagerPID !== 0 }
														onClick={ () => setShowModal( true ) }
													>
														Aktion
													</IconButton>
													<IconButton
														disabled={
															!user.HasPermissionForServer(
																Server.InstanceName
															)
														}
														Hide={ Server.State.ArkmanagerPID <= 1 }
														variant={ "danger" }
														IsLoading={ IsSending }
														onClick={ cancelAction }
													>
														<FontAwesomeIcon icon={ "cancel" }/>
													</IconButton>
												</ButtonGroup>
											</h6>
										</div>
									</div>
								</div>
								<div className="col-12 col-md-3 ps-md-0">
									<div className="info-box mb-0 p-0 rounded-0 h-100">
										<div className="info-box-content pt-2 ps-3 text-center h-100 align-middle">
											<span className="description-text">VERSION</span>
											<h6 className="description-header">
												<b>{ Server.State.ServerVersion }</b>
											</h6>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<ServerAction
				InstanceName={ Server.InstanceName }
				Show={ ShowModals }
				OnClose={ () => setShowModal( false ) }
			/>
		</>
	);
};

export default ServerHead;