import { getDefaultPanelServerConfig } from "@/src/Shared/Default/Server.Default";
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
import type { PanelServerConfig } from "@app/Types/ArkSE";
import type { InputSelectMask } from "@app/Types/Systeminformation";
import { IconButton } from "@comp/Elements/Buttons";
import TableInput from "@comp/Elements/TableInput";
import ServerAction from "@comp/ServerAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAccount from "@hooks/useAccount";
import { useArkServer } from "@hooks/useArkServer";
import { EPerm } from "@shared/Enum/User.Enum";
import UpdateSelectMask from "@shared/SelectMask/Arkmanager_Command_Update.json";
import _ from "lodash";
import type { FC } from "react";
import {
	useEffect,
	useState
} from "react";
import {
	ButtonGroup,
	Modal,
	Table
} from "react-bootstrap";
import { Link } from "react-router-dom";


export interface ServerAdminCardProps {
	instanceName: string
}

const ServerAdminCard: FC<ServerAdminCardProps> = ( { instanceName } ) => {
	const { user } = useAccount();
	const server = useArkServer( instanceName );
	const [ showEditServer, setShowEditServer ] = useState( false );
	const [ showAction, setShowAction ] = useState( false );
	const [ isSending, setIsSending ] = useState( {
		Edit: false,
		Delete: false,
		Cancel: false
	} );
	const [ formData, setFormData ] = useState( getDefaultPanelServerConfig() );

	const removeServer = async() => {
		setIsSending( { ...isSending, Delete: true } );
		const confirm = await onConfirm( "Möchtest du wirklich diese Aktion abbrechen?" );
		if( confirm ) {
			const result = await apiAuth.server.action.removeServer.mutate( {
				instanceName: instanceName
			} ).catch( apiHandleError );
			if( result ) {
				fireSwalFromApi( result, true );
			}
		}
		setIsSending( { ...isSending, Delete: false } );
	};

	const savePanelConfig = async() => {
		const config: PanelServerConfig = _.cloneDeep( formData );
		config.AutoUpdateParameters = config.AutoUpdateParameters.filter(
			e => e.replaceAll( " ", "" ).trim() !== ""
		);

		setIsSending( { ...isSending, Edit: true } );
		const result = await apiAuth.server.action.updatePanelConfig.mutate( {
			instanceName: instanceName,
			config: config
		} ).catch( apiHandleError );
		if( result ) {
			fireSwalFromApi( result, true );
		}
		setIsSending( { ...isSending, Edit: false } );

		setFormData( { ..._.cloneDeep( formData ), ...config } );
		setShowEditServer( false );
	};

	useEffect( () => {
		if( !showEditServer ) {
			setFormData( server.panelConfig );
		}
	}, [ server.panelConfig, showEditServer ] );

	if( !server.isValid() ) {
		return null;
	}

	const cancelAction = async() => {
		setIsSending( { ...isSending, Cancel: true } );
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
		setIsSending( { ...isSending, Cancel: false } );
	};

	return (
		<>
			<div className="col-lg-6 col-xl-4 mt-3">
				<div className="card card-widget widget-user  item-box">
					<div className="rounded-0 card bg-dark card-widget widget-user mb-0">
						<div className="row p-2">
							<div className="col-12 text-center">
								<h5 className="text-center left d-inline pt-3 ps-0 m-0 text-light">
									{ server.data.ark_SessionName }
								</h5>
							</div>
						</div>
					</div>
					<div className="rounded-0 widget-user-header text-white"
						style={ {
							background: `url('${ Server.ServerMap.BG }') center center`
						} }>
						<div style={ { zIndex: 1000, height: 150 } }
							className="position-relative">
							<img src={ server.serverMap.LOGO }
								className="position-absolute top-100 start-50 translate-middle"
								style={ { height: 75, width: 75 } }
								alt={
									server.data.serverMap
								} />
						</div>
					</div>

					<div className="d-flex bd-highlight">
						<div className="rounded-0 p-0 flex-fill bd-highlight">
							<button disabled={ !user.hasPermission( EPerm.ManageServers ) }
								onClick={ () => setShowEditServer( true ) }
								className="w-100 pe-5 rounded-0 btn btn-dark">
								<FontAwesomeIcon icon="cogs" />
							</button>
						</div>
						<div className="rounded-0 p-0 flex-fill bd-highlight">
							<span onClick={ removeServer }
	              className="w-100 ps-5 rounded-0 text-white btn btn-danger"
	              data-toggle="modal">
								<FontAwesomeIcon icon="trash-alt" />
							</span>
						</div>
					</div>

					<div className="card-footer p-0 m-0 bg-light">
						<div className="row">
							<div className="col-sm-6 border-sm-right pe-sm-0 rounded-0">
								<div className="info-box mb-0 p-3 rounded-0 h-100">
									<div className="info-box-content pt-2 ps-3 text-center">
										<span className="description-text"> STATUS </span>
										<h6 className={ `description-header text-${ serverStateToColor(
											server.state.State
										) }` }>
											{ serverStateToReadableString( server.state.State ) }
										</h6>
									</div>
								</div>
							</div>
							<div className="col-sm-6 border-sm-right ps-sm-0 rounded-0">
								<div className="info-box mb-0 p-3 rounded-0 h-100">
									<div className="info-box-content pt-2 ps-3 text-center">
										<span className="description-text">AKTION</span> <br />
										<ButtonGroup>
											<IconButton disabled={
												!user.hasPermissionForServer(
													server.instanceName
												)
											}
											IsLoading={ server.state.ArkmanagerPID !== 0 }
											onClick={ () => setShowAction( true ) }>
												Aktion
											</IconButton>
											<IconButton disabled={
												!user.hasPermissionForServer(
													server.instanceName
												)
											}
											Hide={ server.state.ArkmanagerPID <= 1 }
											variant="danger"
											IsLoading={ isSending.Cancel }
											onClick={ cancelAction }>
												<FontAwesomeIcon icon="cancel" />
											</IconButton>
										</ButtonGroup>
									</div>
								</div>
							</div>
							<div className="col-sm-6 border-sm-right pe-sm-0 rounded-0">
								<div className="info-box mb-0 p-3  rounded-0 h-100">
									<div className="info-box-content pt-2 ps-3 text-center">
										<span className="description-text">SPIELER</span>
										<h6 className="description-header">
											<b>
												{ " " }
												{ server.state.Player } / { server.data.ark_MaxPlayers }{ " " }
											</b>
										</h6>
									</div>
								</div>
							</div>
							<div className="col-sm-6 border-sm-right ps-sm-0 rounded-0">
								<div className="info-box mb-0 p-3  rounded-0 h-100">
									<div className="info-box-content pt-2 ps-3 text-center">
										<span className="description-text">VERSION</span>
										<h6 className="description-header">
											<b>{ server.state.ServerVersion }</b>
										</h6>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="card-footer p-0">
						<div className="row">
							<div className="col-12">
								<Link reloadDocument={ true }
								      to={ `/app/server/${ instanceName }/logs` }
								      className="btn btn-sm btn-dark rounded-0 w-100">
									ServerCenter
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>

			<ServerAction instanceName={ server.instanceName }
				Show={ showAction }
				onClose={ () => setShowAction( false ) } />

			{ user.hasPermission( EPerm.ManageServers ) && (
				<Modal size="xl"
					show={ showEditServer }
					onHide={ () => setShowEditServer( false ) }>
					<Modal.Header closeButton>
						server Bearbeiten: [{ instanceName }] -{ " " }
						{ server.data.ark_SessionName }
					</Modal.Header>
					<Modal.Body className="p-0">
						<Table className="p-0 m-0" striped>
							<tbody>
								{ Object.entries( formData ).map( ( [ Key, Value ], Idx ) => (
									<TableInput Type={
										Array.isArray( Value )
											? "text"
											: typeof Value !== "string"
												? "number"
												: "text"
									}
									key={ instanceName + "EDIT" + Key + Idx }
									Value={ Value }
									onValueSet={ Val => setFormData( curr => ( { ...curr, [ Key ]: Val } ) ) }
									ValueKey={ Key }
									InputSelectMask={ {
										AutoUpdateParameters: UpdateSelectMask as InputSelectMask[]
									} }>
										{ Key }
									</TableInput>
								) ) }
							</tbody>
						</Table>
					</Modal.Body>
					<Modal.Footer>
						<IconButton variant="success"
							IsLoading={ isSending.Edit }
							onClick={ savePanelConfig }>
							<FontAwesomeIcon icon="save" /> Speichern
						</IconButton>
						<IconButton variant="danger"
							onClick={ () => setShowEditServer( false ) }>
							<FontAwesomeIcon icon="cancel" /> Abbrechen
						</IconButton>
					</Modal.Footer>
				</Modal>
			) }
		</>
	);
};

export { ServerAdminCard };

