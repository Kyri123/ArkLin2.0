import {
	serverStateToColor,
	serverStateToReadableString
} from "@app/Lib/Conversion.Lib";
import {
	apiAuth,
	apiHandleError,
	fireSwalFromApi,
	onConfirm
} from "@app/Lib/tRPC";
import { IconButton } from "@comp/Elements/Buttons";
import ServerAction from "@comp/ServerAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAccount from "@hooks/useAccount";
import { useArkServer } from "@hooks/useArkServer";
import type { ServerAdminCardProps } from "@page/app/pageComponents/adminServer/ServerAdminCard";
import type { FC } from "react";
import { useState } from "react";
import { ButtonGroup } from "react-bootstrap";
import { Link } from "react-router-dom";


const ServerHead: FC<ServerAdminCardProps> = ( { instanceName } ) => {
	const { user } = useAccount();
	const server = useArkServer( instanceName );
	const [ showModals, setShowModal ] = useState( false );
	const [ isSending, setIsSending ] = useState( false );

	const cancelAction = async() => {
		setIsSending( true );
		const confirm = await onConfirm( "Möchtest du wirklich diese Aktion abbrechen?" );
		if( confirm ) {
			const result = await apiAuth.server.action.killAction.mutate( {
				instanceName: instanceName,
				killServer: false
			} ).catch( apiHandleError );
			if( result ) {
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
						<div className="widget-user-header rounded-0 text-white p-0"
							style={ {
								background: `url('${ server.serverMap.BG }') center right`
							} }>
							<div style={ {
								backgroundColor: "rgba(66,66,66,0.30)",
								height: "100%"
							} }
							className="p-3">
								<h3 className="widget-user-username text-center text-light left">
									{ server.data.ark_SessionName }
								</h3>

								{ server.state.IsListen ? (
									<h5 className="widget-user-desc text-center">
										<Link to={ `steam://connect/${ server.data.panel_publicip }:${ server.data.ark_QueryPort }` }
											className="text-light">
											{ server.data.panel_publicip }:{ server.data.ark_QueryPort }
										</Link>
									</h5>
								) : (
									<h5 className="widget-user-desc text-center text-light">
										{ server.data.panel_publicip }:{ server.data.ark_QueryPort }
									</h5>
								) }
							</div>
							<div style={ { zIndex: 1000, height: 50 } }
								className="position-relative">
								<img src={ server.serverMap.LOGO }
									className="position-absolute top-100 start-50 translate-middle"
									style={ { height: 100, width: 100 } }
									alt={
										server.data.serverMap
									} />
							</div>
						</div>
						<div className="card-footer p-0">
							<div className="row">
								<div className="col-12 col-md-3 pe-md-0">
									<div className="info-box mb-0 p-0 rounded-0 h-100">
										<div className="info-box-content pt-2 ps-3 text-center h-100 align-middle">
											<span className="description-text"> STATUS </span>
											<h6 className={ `description-header text-${ serverStateToColor(
												server.state.State
											) }` }>
												{ " " }
												{ serverStateToReadableString( server.state.State ) }
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
												{ server.state.Player } / { server.data.ark_MaxPlayers }{ " " }
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
													<IconButton disabled={
														!user.hasPermissionForServer(
															server.instanceName
														)
													}
													IsLoading={ server.state.ArkmanagerPID !== 0 }
													onClick={ () => setShowModal( true ) }>
														Aktion
													</IconButton>
													<IconButton disabled={
														!user.hasPermissionForServer(
															server.instanceName
														)
													}
													Hide={ server.state.ArkmanagerPID <= 1 }
													variant="danger"
													IsLoading={ isSending }
													onClick={ cancelAction }>
														<FontAwesomeIcon icon="cancel" />
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
												<b>{ server.state.ServerVersion }</b>
											</h6>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<ServerAction instanceName={ server.instanceName }
				Show={ showModals }
				onClose={ () => setShowModal( false ) } />
		</>
	);
};

export default ServerHead;
