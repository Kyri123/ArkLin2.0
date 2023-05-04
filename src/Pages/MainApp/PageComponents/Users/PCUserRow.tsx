import type React           from "react";
import {
	useContext,
	useState
}                           from "react";
import type { UserAccount } from "../../../../Types/MongoDB";
import {
	ButtonGroup,
	Card,
	Modal,
	Nav
}                          from "react-bootstrap";
import {
	LTELoadingButton,
	LTEToggleButton
}                          from "../../../../Components/Elements/AdminLTE/AdminLTE_Buttons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { API_User }         from "../../../../Lib/Api/API_User";
import {
	EPerm,
	EPerm_Server
}                           from "@shared/Enum/User.Enum";
import AlertContext         from "@context/AlertContext";
import ServerContext        from "@context/ServerContext";
import AccountContext       from "@context/AccountContext";

interface IProps {
	User : UserAccount;
	Remove : ( Id : string, IsKey : boolean ) => void;
	UpdateUsers : () => void;
}

const PCUserRow : React.FunctionComponent<IProps> = ( {
	User,
	Remove,
	UpdateUsers
} ) => {
	const { setAcceptAction, DoSetAlert } = useContext( AlertContext );
	const { InstanceData } = useContext( ServerContext );
	const { Account } = useContext( AccountContext );
	const [ Form, setForm ] = useState( () => User );
	const [ IsSending, setIsSending ] = useState( false );
	const [ ShowServerModal, setShowServerModal ] = useState( false );
	const [ ShowPermissionModal, setShowPermissionModal ] = useState( false );
	const [ SelectedPermission, setSelectedPermission ] = useState<any>( EPerm );

	const SetAllowedServer = async() => {
		setIsSending( true );
		const Result = await API_User.EditUser( User._id!, {
			servers: Form.servers
		} );
		DoSetAlert( Result );
		if ( Result.Success ) {
			UpdateUsers();
		}
		setShowServerModal( false );
		setIsSending( false );
	};

	const SetPermissions = async() => {
		setIsSending( true );
		const Result = await API_User.EditUser( User._id!, {
			permissions: Form.permissions
		} );
		DoSetAlert( Result );
		if ( Result.Success ) {
			UpdateUsers();
		}
		setShowPermissionModal( false );
		setIsSending( false );
	};

	const RemoveMiddleware = async( Id : string ) => {
		setIsSending( true );
		await Remove( Id, false );
		setIsSending( false );
	};

	return (
		<>
			<tr>
				<td style={ { width: 0 } }>{ User._id }</td>
				<td>{ User.username }</td>
				<td>{ User.mail }</td>
				<td>
					{ Account.GetDBInformation()._id !== User._id && (
						<ButtonGroup>
							<LTELoadingButton
								onClick={ () =>
									setAcceptAction( {
										Payload: RemoveMiddleware,
										PayloadArgs: [ User._id ],
										ActionTitle: `Möchtest du den Benutzer ${ User.username } wirklich löschen?`
									} )
								}
								className={ "btn-sm flat" }
								IsLoading={ IsSending }
								variant="danger"
							>
								<FontAwesomeIcon icon={ "trash-alt" }/>
							</LTELoadingButton>
							<LTELoadingButton
								onClick={ () => setShowServerModal( true ) }
								className={ "btn-sm flat" }
								IsLoading={ false }
							>
								<FontAwesomeIcon icon={ "server" }/>
							</LTELoadingButton>
							<LTELoadingButton
								onClick={ () => setShowPermissionModal( true ) }
								className={ "btn-sm flat" }
								IsLoading={ false }
							>
								<FontAwesomeIcon icon={ "ranking-star" }/>
							</LTELoadingButton>
						</ButtonGroup>
					) }
				</td>
			</tr>

			<Modal
				size="xl"
				show={ ShowPermissionModal }
				onHide={ () => {
					setShowPermissionModal( false );
				} }
			>
				<Modal.Header closeButton>
					<Modal.Title id="example-modal-sizes-title-sm">
						Account Keys
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className={ "p-0" }>
					<Nav variant="tabs" defaultActiveKey="/home">
						<Nav.Item>
							<Nav.Link onClick={ () => setSelectedPermission( EPerm ) }>
								Haupt Rechte
							</Nav.Link>
						</Nav.Item>
						{ !Form.permissions?.includes( "Super" ) && (
							<Nav.Item>
								<Nav.Link onClick={ () => setSelectedPermission( EPerm_Server ) }>
									Server Rechte
								</Nav.Link>
							</Nav.Item>
						) }
					</Nav>
					<table className={ "p-3 table m-0 table-striped" }>
						<tbody>
						{ Object.entries(
							!Form.permissions?.includes( "Super" )
								? SelectedPermission
								: EPerm
						).map( ( [ Key, Text ] ) => {
							if ( Form.permissions?.includes( "Super" ) && "Super" !== Key ) {
								return undefined;
							}

							return (
								<tr key={ Key }>
									<td className={ "p-0" } style={ { width: 0 } }>
										<LTEToggleButton
											className={ " w-100 h-100 flat " }
											Value={ Form.permissions?.includes( Key ) || false }
											OnToggle={ ( Value : boolean ) =>
												setForm( ( Current ) => {
													let Permissions = [ ...Current.permissions! ];
													if ( Value ) {
														Permissions.push( Key );
													}
													else {
														Permissions = Permissions.filter(
															( E ) => E !== Key
														);
													}
													return {
														...Current,
														permissions: Permissions
													};
												} )
											}
										/>
									</td>
									<td className={ "p-2" }>{ Text as string }</td>
								</tr>
							);
						} ) }
						</tbody>
					</table>
				</Modal.Body>
				<Modal.Footer>
					<Card className={ "m-0" }>
						<div className="input-group">
							<div className="input-group-append">
								<LTELoadingButton
									onClick={ SetPermissions }
									className={ "btn-sm flat" }
									IsLoading={ IsSending }
									variant="success"
								>
									<FontAwesomeIcon icon={ "check" }/> Speichern
								</LTELoadingButton>
								<LTELoadingButton
									onClick={ () => setShowPermissionModal( false ) }
									className={ "btn-sm flat" }
									variant="danger"
								>
									<FontAwesomeIcon icon={ "cancel" }/> Abbrechen
								</LTELoadingButton>
							</div>
						</div>
					</Card>
				</Modal.Footer>
			</Modal>

			<Modal
				size="lg"
				show={ ShowServerModal }
				onHide={ () => {
					setShowServerModal( false );
				} }
			>
				<Modal.Header closeButton>
					<Modal.Title id="example-modal-sizes-title-sm">
						Account Keys
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className={ "p-0" }>
					<table className={ "table table-striped w-100 m-0" }>
						<thead>
						<tr>
							<th style={ { width: 0 } }></th>
							<th>ID</th>
							<th>Server</th>
						</tr>
						</thead>
						<tbody>
						{ Object.entries( InstanceData ).map( ( [ Instance, InstanceData ] ) => {
							return (
								<tr key={ "SERV" + Instance }>
									<td style={ { width: 0 } } className="p-2">
										<ButtonGroup>
											<LTEToggleButton
												Value={ Form.servers.includes( Instance ) }
												OnToggle={ ( V : boolean ) =>
													setForm( ( Current ) => {
														const Cur = { ...Current };
														if ( V ) {
															Cur.servers.push( Instance );
														}
														else {
															Cur.servers = Cur.servers.filter(
																( E : string ) => E !== Instance
															);
														}
														return Cur;
													} )
												}
											/>
										</ButtonGroup>
									</td>
									<td>{ Instance }</td>
									<td>{ InstanceData.ArkmanagerCfg.ark_SessionName }</td>
								</tr>
							);
						} ) }
						</tbody>
					</table>
				</Modal.Body>
				<Modal.Footer>
					<Card className={ "m-0" }>
						<div className="input-group">
							<div className="input-group-append">
								<LTELoadingButton
									onClick={ SetAllowedServer }
									className={ "btn-sm flat" }
									IsLoading={ IsSending }
									variant="success"
								>
									<FontAwesomeIcon icon={ "check" }/> Speichern
								</LTELoadingButton>
								<LTELoadingButton
									onClick={ () => setShowServerModal( false ) }
									className={ "btn-sm flat" }
									variant="danger"
								>
									<FontAwesomeIcon icon={ "cancel" }/> Abbrechen
								</LTELoadingButton>
							</div>
						</div>
					</Card>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default PCUserRow;
