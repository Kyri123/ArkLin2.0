import {
	apiAuth,
	apiHandleError,
	fireSwalFromApi
} from "@app/Lib/tRPC";
import {
	IconButton,
	ToggleButton
} from "@comp/Elements/Buttons";
import ServerContext from "@context/ServerContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAccount from "@hooks/useAccount";
import { useToggle } from "@kyri123/k-reactutils";
import type { UserAccount } from "@server/MongoDB/MongoAccounts";
import {
	EPerm,
	EPermServer
} from "@shared/Enum/User.Enum";
import type React from "react";
import {
	useContext,
	useState
} from "react";
import {
	ButtonGroup,
	Card,
	Modal,
	Nav
} from "react-bootstrap";


interface IProps {
	User: UserAccount,
	refresh: () => void
}

const UserRow: React.FunctionComponent<IProps> = ( { User, refresh } ) => {
	const { user } = useAccount();
	const { instanceData } = useContext( ServerContext );
	const [ form, setForm ] = useState<UserAccount>( () => User );
	const [ isSending, setIsSending ] = useState( false );
	const [ serverModal, toggleServerModal ] = useToggle( false );
	const [ permissionModal, togglePermissionModal ] = useToggle( false );
	const [ selectedPermission, setSelectedPermission ] = useState<any>( EPerm );

	const setPermissions = async() => {
		setIsSending( true );
		const result = await apiAuth.admin.account.updatePermissions.mutate( {
			accountId: User._id!,
			permissions: form.permissions,
			servers: form.servers
		} ).catch( apiHandleError );
		if( result ) {
			fireSwalFromApi( result, true );
			await refresh();
		}
		setIsSending( false );
	};

	const setAllowedServer = async() => {
		await setPermissions();
	};

	const removeUser = async() => {
		setIsSending( true );
		const accept = await fireSwalFromApi( "Möchtest du wirklich diesen Benutzer löschen?", "question", {
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Ja",
			cancelButtonText: "Nein",
			timer: 5000
		} );
		if( accept?.isConfirmed ) {
			const result = await apiAuth.admin.account.removeAccount.mutate( User._id! ).catch( apiHandleError );
			if( result ) {
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
					{ user.get._id !== User._id && (
						<ButtonGroup>
							<IconButton onClick={ removeUser }
								className="btn-sm flat"
								IsLoading={ isSending }
								variant="danger">
								<FontAwesomeIcon icon="trash-alt" />
							</IconButton>
							<IconButton onClick={ toggleServerModal }
								className="btn-sm flat"
								IsLoading={ false }>
								<FontAwesomeIcon icon="server" />
							</IconButton>
							<IconButton onClick={ togglePermissionModal }
								className="btn-sm flat"
								IsLoading={ false }>
								<FontAwesomeIcon icon="ranking-star" />
							</IconButton>
						</ButtonGroup>
					) }
				</td>
			</tr>

			<Modal size="xl"
				show={ permissionModal }
				onHide={ togglePermissionModal }>
				<Modal.Header closeButton>
					<Modal.Title id="example-modal-sizes-title-sm">
						Account Keys
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="p-0">
					<Nav variant="tabs" defaultActiveKey="/home">
						<Nav.Item>
							<Nav.Link onClick={ () => setSelectedPermission( EPerm ) }>
								Haupt Rechte
							</Nav.Link>
						</Nav.Item>
						{ !form.permissions?.includes( "Super" ) && (
							<Nav.Item>
								<Nav.Link onClick={ () => setSelectedPermission( EPermServer ) }>
									Server Rechte
								</Nav.Link>
							</Nav.Item>
						) }
					</Nav>
					<table className="p-3 table m-0 table-striped">
						<tbody>
							{ Object.entries(
								!form.permissions?.includes( "Super" )
									? selectedPermission
									: EPerm
							).map( ( [ Key, Text ] ) => {
								if( form.permissions?.includes( "Super" ) && "Super" !== Key ) {
									return undefined;
								}

								return (
									<tr key={ Key }>
										<td className="p-0" style={ { width: 0 } }>
											<ToggleButton className=" w-100 h-100 flat "
												Value={ form.permissions?.includes( Key ) || false }
												onToggle={ ( Value: boolean ) =>
													setForm( Current => {
														let permissions = [ ...Current.permissions! ];
														if( Value ) {
															permissions.push( Key );
														} else {
															permissions = permissions.filter(
																E => E !== Key
															);
														}
														return {
															...Current,
															permissions: permissions
														};
													} ) } />
										</td>
										<td className="p-2">{ Text as string }</td>
									</tr>
								);
							} ) }
						</tbody>
					</table>
				</Modal.Body>
				<Modal.Footer>
					<Card className="m-0">
						<div className="input-group">
							<div className="input-group-append">
								<IconButton onClick={ setPermissions }
									className="btn-sm flat"
									IsLoading={ isSending }
									variant="success">
									<FontAwesomeIcon icon="check" /> Speichern
								</IconButton>
								<IconButton onClick={ togglePermissionModal }
									className="btn-sm flat"
									variant="danger">
									<FontAwesomeIcon icon="cancel" /> Abbrechen
								</IconButton>
							</div>
						</div>
					</Card>
				</Modal.Footer>
			</Modal>

			<Modal size="lg"
				show={ serverModal }
				onHide={ toggleServerModal }>
				<Modal.Header closeButton>
					<Modal.Title id="example-modal-sizes-title-sm">
						Account Keys
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="p-0">
					<table className="table table-striped w-100 m-0">
						<thead>
							<tr>
								<th style={ { width: 0 } }></th>
								<th>ID</th>
								<th>Server</th>
							</tr>
						</thead>
						<tbody>
							{ Object.entries( instanceData ).map( ( [ Instance, instanceData ] ) => (
								<tr key={ "SERV" + Instance }>
									<td style={ { width: 0 } } className="p-2">
										<ButtonGroup>
											<ToggleButton Value={ form.servers.includes( Instance ) }
												onToggle={ ( V: boolean ) =>
													setForm( Current => {
														const cur = { ...Current };
														if( V ) {
															cur.servers.push( Instance );
														} else {
															cur.servers = cur.servers.filter(
																( E: string ) => E !== Instance
															);
														}
														return cur;
													} ) } />
										</ButtonGroup>
									</td>
									<td>{ Instance }</td>
									<td>{ instanceData.ArkmanagerCfg.ark_SessionName }</td>
								</tr>
							) ) }
						</tbody>
					</table>
				</Modal.Body>
				<Modal.Footer>
					<Card className="m-0">
						<div className="input-group">
							<div className="input-group-append">
								<IconButton onClick={ setAllowedServer }
									className="btn-sm flat"
									IsLoading={ isSending }
									variant="success">
									<FontAwesomeIcon icon="check" /> Speichern
								</IconButton>
								<IconButton onClick={ toggleServerModal }
									className="btn-sm flat"
									variant="danger">
									<FontAwesomeIcon icon="cancel" /> Abbrechen
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
