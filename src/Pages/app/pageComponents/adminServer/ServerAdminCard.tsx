import { Link }                        from "react-router-dom";
import type { FC }                     from "react";
import {
	useEffect,
	useState
}                                      from "react";
import { FontAwesomeIcon }             from "@fortawesome/react-fontawesome";
import {
	ServerStateToColor,
	ServerStateToReadableString
}                                      from "@app/Lib/Conversion.Lib";
import { useArkServer }                from "@hooks/useArkServer";
import {
	ButtonGroup,
	Modal
}                                      from "react-bootstrap";
import { EPerm }                       from "@shared/Enum/User.Enum";
import { GetDefaultPanelServerConfig } from "@shared/Default/Server.Default";
import { IconButton }                  from "@comp/Elements/AdminLTE/Buttons";
import Update_SelectMask               from "@shared/SelectMask/Arkmanager_Command_Update.json";
import CServerAction                   from "../../../MainApp/PageComponents/Server/CServerAction";
import CLTEInput                       from "@comp/Elements/AdminLTE/AdminLTE_Inputs";
import type { PanelServerConfig }      from "@app/Types/ArkSE";
import useAccount                      from "@hooks/useAccount";
import type { ISelectMask }            from "@app/Types/Systeminformation";

export interface ServerAdminCardProps {
	InstanceName : string;
}

const ServerAdminCard : FC<ServerAdminCardProps> = ( { InstanceName } ) => {
	const { user } = useAccount();
	const [ SendCancel, setSendCancel ] = useState( false );
	const Server = useArkServer( InstanceName );
	const [ ShowEditServer, setShowEditServer ] = useState( false );
	const [ ShowAction, setShowAction ] = useState( false );
	const [ IsSending, setIsSending ] = useState( {
		Edit: false,
		Delete: false
	} );
	const [ FormData, setFormData ] = useState( GetDefaultPanelServerConfig() );

	const RemoveServer = async() => {
		setIsSending( { ...IsSending, Delete: true } );
		setIsSending( { ...IsSending, Delete: false } );
	};

	const SavePanelConfig = async() => {
		const CopyForm : PanelServerConfig = structuredClone( FormData );
		CopyForm.AutoUpdateParameters = CopyForm.AutoUpdateParameters.filter(
			( e ) => e.replaceAll( " ", "" ).trim() !== ""
		);
		setIsSending( { ...IsSending, Edit: true } );
		setFormData( {
			...FormData,
			...CopyForm
		} );
		setIsSending( { ...IsSending, Edit: false } );
		setShowEditServer( false );
	};

	useEffect( () => {
		if ( !ShowEditServer ) {
			setFormData( Server.PanelConfig );
		}
	}, [ Server.PanelConfig, ShowEditServer ] );

	if ( !Server.IsValid() ) {
		return null;
	}

	const cancelAction = async() => {

	};

	return (
		<>
			<div className="col-lg-6 col-xl-4 mt-3">
				<div className="card card-widget widget-user  item-box">
					<div className="rounded-0 card bg-dark card-widget widget-user mb-0">
						<div className="row p-2">
							<div className="col-12 text-center">
								<h5 className="text-center left d-inline pt-3 ps-0 m-0 text-light">
									{ Server.Data.ark_SessionName }
								</h5>
							</div>
						</div>
					</div>
					<div
						className="rounded-0 widget-user-header text-white"
						style={ {
							background: "url('/img/backgrounds/sc.jpg') center center"
						} }
					>
						<div
							style={ { zIndex: 1000, height: 150 } }
							className={ "position-relative" }
						>
							<img
								src={ Server.ServerMap.LOGO }
								className="position-absolute top-100 start-50 translate-middle"
								style={ { height: 75, width: 75 } }
								alt={
									Server.Data.serverMap
								} /*style="border-top-width: 3px!important;height: 90px;width: 90px;background-color: #001f3f"*/
							/>
						</div>
					</div>

					<div className="d-flex bd-highlight">
						<div className="rounded-0 p-0 flex-fill bd-highlight">
							<button
								disabled={ !user.HasPermission( EPerm.ManageServers ) }
								onClick={ () => setShowEditServer( true ) }
								className="w-100 pe-5 rounded-0 btn btn-dark"
							>
								<FontAwesomeIcon icon={ "cogs" }/>
							</button>
						</div>
						<div className="rounded-0 p-0 flex-fill bd-highlight">
              <span
	              onClick={ RemoveServer }
	              className="w-100 ps-5 rounded-0 text-white btn btn-danger"
	              data-toggle="modal"
              >
                <FontAwesomeIcon icon={ "trash-alt" }/>
              </span>
						</div>
					</div>

					<div className="card-footer p-0 m-0 bg-light">
						<div className="row">
							<div className="col-sm-6 border-sm-right pe-sm-0 rounded-0">
								<div className="info-box mb-0 p-3 rounded-0 h-100">
									<div className="info-box-content pt-2 ps-3 text-center">
										<span className="description-text"> STATUS </span>
										<h6
											className={ `description-header text-${ ServerStateToColor(
												Server.State.State
											) }` }
										>
											{ ServerStateToReadableString( Server.State.State ) }
										</h6>
									</div>
								</div>
							</div>
							<div className="col-sm-6 border-sm-right ps-sm-0 rounded-0">
								<div className="info-box mb-0 p-3 rounded-0 h-100">
									<div className="info-box-content pt-2 ps-3 text-center">
										<span className="description-text">AKTION</span> <br/>
										<ButtonGroup>
											<IconButton
												disabled={
													!user.HasPermissionForServer(
														Server.InstanceName
													)
												}
												IsLoading={ Server.State.ArkmanagerPID !== 0 }
												onClick={ () => setShowAction( true ) }
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
												IsLoading={ SendCancel }
												onClick={ cancelAction }
											>
												<FontAwesomeIcon icon={ "cancel" }/>
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
												{ Server.State.Player } / { Server.Data.ark_MaxPlayers }{ " " }
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
											<b>{ Server.State.ServerVersion }</b>
										</h6>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="card-footer p-0">
						<div className="row">
							<div className="col-12">
								<Link
									to={ `/server/${ InstanceName }/logs` }
									className="btn btn-sm btn-dark rounded-0 w-100"
								>
									ServerCenter
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>

			<CServerAction
				InstanceName={ Server.InstanceName }
				Show={ ShowAction }
				OnClose={ () => setShowAction( false ) }
			/>

			{ user.HasPermission( EPerm.ManageServers ) && (
				<Modal
					size={ "lg" }
					show={ ShowEditServer }
					onHide={ () => setShowEditServer( false ) }
				>
					<Modal.Header closeButton>
						Server Bearbeiten: [{ InstanceName }] -{ " " }
						{ Server.Data.ark_SessionName }
					</Modal.Header>
					<Modal.Body>
						{ Object.entries( FormData ).map( ( [ Key, Value ], Idx ) => (
							<CLTEInput
								Type={
									Array.isArray( Value )
										? "text"
										: typeof Value !== "string"
											? "number"
											: "text"
								}
								key={ InstanceName + "EDIT" + Key + Idx }
								Value={ Value }
								OnValueSet={ ( Val ) => {
									const Obj : Record<string, any> = {};
									Obj[ Key ] = Val;
									setFormData( {
										...FormData,
										...Obj
									} );
								} }
								ValueKey={ Key }
								SelectMask={ {
									AutoUpdateParameters: Update_SelectMask as ISelectMask[]
								} }
							>
								{ Key }
							</CLTEInput>
						) ) }
					</Modal.Body>
					<Modal.Footer>
						<IconButton
							variant={ "success" }
							IsLoading={ IsSending.Edit }
							onClick={ SavePanelConfig }
						>
							<FontAwesomeIcon icon={ "save" }/> Speichern
						</IconButton>
						<IconButton
							variant={ "danger" }
							onClick={ () => setShowEditServer( false ) }
						>
							<FontAwesomeIcon icon={ "cancel" }/> Abbrechen
						</IconButton>
					</Modal.Footer>
				</Modal>
			) }
		</>
	);
};

export { ServerAdminCard };