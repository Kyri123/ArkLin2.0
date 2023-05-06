import type React           from "react";
import {
	useContext,
	useState
}                           from "react";
import {
	ButtonGroup,
	Card,
	Modal,
	Nav
}                           from "react-bootstrap";
import {
	IconButton,
	ToggleButton
}                           from "@comp/Elements/Buttons";
import { FontAwesomeIcon }  from "@fortawesome/react-fontawesome";
import {
	EPerm,
	EPerm_Server
}                           from "@shared/Enum/User.Enum";
import ServerContext        from "@context/ServerContext";
import { useToggle }        from "@kyri123/k-reactutils";
import useAccount           from "@hooks/useAccount";
import type { UserAccount } from "@server/MongoDB/DB_Accounts";
import {
	fireSwalFromApi,
	tRPC_Auth,
	tRPC_handleError
}                           from "@app/Lib/tRPC";

interface IProps {
	User : UserAccount;
	refresh : () => void;
}

const UserRow : React.FunctionComponent<IProps> = ( { User, refresh } ) => {
	const { user } = useAccount();
	const { InstanceData } = useContext( ServerContext );
	const [ Form, setForm ] = useState<UserAccount>( () => User );
	const [ IsSending, setIsSending ] = useState( false );
	const [ serverModal, toggleServerModal ] = useToggle( false );
	const [ permissionModal, togglePermissionModal ] = useToggle( false );
	const [ SelectedPermission, setSelectedPermission ] = useState<any>( EPerm );

	const SetPermissions = async() => {
		setIsSending( true );
		const result = await tRPC_Auth.admin.account.updatePermissions.mutate( {
			accountId: User._id!,
			permissions: Form.permissions,
			servers: Form.servers
		} ).catch( tRPC_handleError );
		if ( result ) {
			fireSwalFromApi( result, true );
			await refresh();
		}
		setIsSending( false );
	};

	const SetAllowedServer = async() => {
		await SetPermissions();
	};

	const RemoveUser = async() => {
		setIsSending( true );
		const accept = await fireSwalFromApi( "Möchtest du wirklich diesen Benutzer löschen?", "question", {
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Ja",
			cancelButtonText: "Nein",
			timer: 5000
		} );
		if ( accept?.isConfirmed ) {
			const result = await tRPC_Auth.admin.account.removeAccount.mutate( User._id! ).catch( tRPC_handleError );
			if ( result ) {
				fireSwalFromApi( result, true );
				await refresh();
			}
		}
		setIsSending( false );
	};

	return (
		<>
			<tr>
				<td style={ { width: 0 } }>{ User._id }</td>
				<td>{ User.username }</td>
				<td>{ User.mail }</td>
				<td>
					{ user.GetDBInformation()._id !== User._id && (
						<ButtonGroup>
							<IconButton
								onClick={ RemoveUser }
								className={ "btn-sm flat" }
								IsLoading={ IsSending }
								variant="danger"
							>
								<FontAwesomeIcon icon={ "trash-alt" }/>
							</IconButton>
							<IconButton
								onClick={ toggleServerModal }
								className={ "btn-sm flat" }
								IsLoading={ false }
							>
								<FontAwesomeIcon icon={ "server" }/>
							</IconButton>
							<IconButton
								onClick={ togglePermissionModal }
								className={ "btn-sm flat" }
								IsLoading={ false }
							>
								<FontAwesomeIcon icon={ "ranking-star" }/>
							</IconButton>
						</ButtonGroup>
					) }
				</td>
			</tr>

			<Modal
				size="xl"
				show={ permissionModal }
				onHide={ togglePermissionModal }
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
										<ToggleButton
											className={ " w-100 h-100 flat " }
											Value={ Form.permissions?.includes( Key ) || false }
											OnToggle={ ( Value : boolean ) =>
												setForm( Current => {
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
								<IconButton
									onClick={ SetPermissions }
									className={ "btn-sm flat" }
									IsLoading={ IsSending }
									variant="success"
								>
									<FontAwesomeIcon icon={ "check" }/> Speichern
								</IconButton>
								<IconButton
									onClick={ togglePermissionModal }
									className={ "btn-sm flat" }
									variant="danger"
								>
									<FontAwesomeIcon icon={ "cancel" }/> Abbrechen
								</IconButton>
							</div>
						</div>
					</Card>
				</Modal.Footer>
			</Modal>

			<Modal
				size="lg"
				show={ serverModal }
				onHide={ toggleServerModal }
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
											<ToggleButton
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
								<IconButton
									onClick={ SetAllowedServer }
									className={ "btn-sm flat" }
									IsLoading={ IsSending }
									variant="success"
								>
									<FontAwesomeIcon icon={ "check" }/> Speichern
								</IconButton>
								<IconButton
									onClick={ toggleServerModal }
									className={ "btn-sm flat" }
									variant="danger"
								>
									<FontAwesomeIcon icon={ "cancel" }/> Abbrechen
								</IconButton>
							</div>
						</div>
					</Card>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default UserRow;
