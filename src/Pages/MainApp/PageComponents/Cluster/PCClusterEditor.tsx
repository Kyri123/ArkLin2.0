import type { FunctionComponent } from "react";
import {
	useContext,
	useEffect,
	useMemo,
	useState
}                                 from "react";
import {
	FormControl,
	InputGroup,
	Modal
}                                 from "react-bootstrap";
import { DefaultCluster }         from "@shared/Default/Server.Default";
import {
	IconButton,
	ToggleButton
}                                 from "@comp/Elements/AdminLTE/Buttons";
import { FontAwesomeIcon }        from "@fortawesome/react-fontawesome";
import type {
	MultiValue,
	SingleValue
}                                 from "react-select";
import Select                     from "react-select";
import ServerContext              from "@context/ServerContext";
import type { InstanceData }      from "@app/Types/ArkSE";
import { useCluster }             from "@hooks/useCluster";
import type { Cluster }           from "@server/MongoDB/DB_Cluster";
import {
	fireSwalFromApi,
	tRPC_Auth,
	tRPC_handleError
}                                 from "@app/Lib/tRPC";
import type { SelectOption }      from "@app/Types/Systeminformation";

interface IPCClusterElementProps {
	show : boolean;
	ClusterID? : string;
	onHide : () => void;
	refresh : () => void;
}

const DisabledOptions : ( keyof InstanceData )[] = [
	"arkserverexec", "logdir", "arkserverroot", "arkbackupdir", "arkStagingDir", "Instance"
];

const RemovedOptions : ( keyof InstanceData )[] = [
	"_id", "__v", "panel_publicip", "ark_Port", "ark_QueryPort", "ark_RCONPort"
];

const PPClusterEditor : FunctionComponent<IPCClusterElementProps> = ( { ClusterID, onHide, show, refresh } ) => {
	const { InstanceData } = useContext( ServerContext );
	const { Cluster, IsValid } = useCluster( ClusterID || "" );
	const [ Form, setForm ] = useState<Cluster>( { ...DefaultCluster } );
	const [ IsSending, setIsSending ] = useState<boolean>( false );
	const [ SelectedServer, setSelectedServer ] = useState<MultiValue<SelectOption>>( [] );
	const [ SelectedServerSettings, setSelectedServerSettings ] = useState<MultiValue<SelectOption>>( [] );

	// ArkmanagerSync
	const [ ArkmanagerSync, setArkmanagerSync ] = useState<MultiValue<SelectOption>>( [] );
	// Ini sync
	const [ FileSync, setFileSync ] = useState<MultiValue<SelectOption>>( [] );
	const [ SelectedMaster, setSelectedMaster ] = useState<SingleValue<SelectOption>>( null );

	const MasterServer = useMemo( () => {
		if ( SelectedMaster && SelectedMaster.value !== "" && InstanceData[ SelectedMaster.value ] ) {
			return InstanceData[ SelectedMaster.value ];
		}
		return undefined;
	}, [ SelectedMaster, InstanceData ] );

	useEffect( () => {
		if ( MasterServer ) {
			setFileSync( ( MasterServer?.State.allConfigs || [] ).map<SelectOption>( e => ( {
				label: e,
				value: e
			} ) ) );
		}
		else {
			setFileSync( [] );
		}
	}, [ MasterServer ] );

	useEffect( () => {
		setIsSending( false );
		setForm( () => IsValid ? { ...Cluster } : { ...DefaultCluster } );
		setSelectedServer( () => IsValid ? Cluster.Instances.map( Instance => {
			if ( InstanceData[ Instance ] ) {
				return {
					value: Instance,
					label: InstanceData[ Instance ].ArkmanagerCfg.ark_SessionName
				};
			}
			return {
				value: Instance,
				label: Instance
			};
		} ) : [] );
		setSelectedServerSettings( !IsValid ? [] : Cluster.SyncInis.map( E => ( { label: E, value: E } ) ) );
		setArkmanagerSync( !IsValid ? [] : Cluster.SyncSettings.map( E => ( { label: E, value: E } ) ) );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ ClusterID, IsValid ] );

	useEffect( () => {
		if ( !SelectedServer ) {
			return;
		}

		if ( SelectedServer.length === 0 && SelectedMaster?.value !== "" ) {
			setSelectedMaster( () => ( { value: "", label: "" } ) );
			setArkmanagerSync( () => [] );
			setSelectedServerSettings( () => [] );
		}

		if ( ( SelectedMaster?.value === "" ) && SelectedServer.length !== 0 ) {
			setSelectedMaster( () => SelectedServer[ 0 ] );
		}

		if ( SelectedServer.find( E => E.value === SelectedMaster!.value ) === undefined && SelectedServer.length !== 0 ) {
			setSelectedMaster( () => SelectedServer[ 0 ] );
		}
	}, [ SelectedServer, SelectedMaster, ClusterID ] );

	const Save = async() => {
		setIsSending( true );

		const data : Cluster = {
			...Form,
			Master: SelectedMaster?.value || "",
			Instances: SelectedServer.map( Instance => Instance.value ),
			SyncSettings: ArkmanagerSync.map( Instance => Instance.value ),
			SyncInis: SelectedServerSettings.map( Instance => Instance.value )
		};

		if ( IsValid && !!ClusterID ) {
			setIsSending( true );
			const result = await tRPC_Auth.server.clusterManagement.editCluster.mutate( {
				id: ClusterID!,
				data
			} ).catch( tRPC_handleError );
			if ( result ) {
				await refresh();
				onHide();
				fireSwalFromApi( result, true );
			}
			setIsSending( false );
		}
		else {
			setIsSending( true );
			const result = await tRPC_Auth.server.clusterManagement.createCluster.mutate( { data } ).catch( tRPC_handleError );
			if ( result ) {
				await refresh();
				onHide();
				fireSwalFromApi( result, true );
			}
			setIsSending( false );
		}

		setIsSending( false );
	};

	const ServerSettingsOptions = useMemo( () => {
		let Options : SelectOption[] = [];

		if ( MasterServer ) {
			Options = Object.keys( MasterServer.ArkmanagerCfg ).filter( E => !RemovedOptions.includes( E ) ).map( Key => ( {
				label: Key,
				value: Key,
				disabled: DisabledOptions.includes( Key )
			} ) );
		}

		return Options;
	}, [ MasterServer ] );

	const ServerSelectOptions = useMemo( () => {
		const options : SelectOption[] = [];
		for ( const [ Instance, Data ] of Object.entries( InstanceData ) ) {
			const IsInCluster = !!Data.Cluster && Data.Cluster.Instances.includes( Instance );
			options.push( {
				value: Instance,
				label: `${ Data.ArkmanagerCfg.ark_SessionName } ${ IsInCluster ? "(In einem Cluster)" : "" }`,
				disabled: IsInCluster
			} );
		}
		return options;
	}, [ InstanceData ] );

	return (
		<Modal size="lg" centered show={ show } onHide={ onHide }>
			<Modal.Header closeButton>
				<Modal.Title>
					{ ClusterID !== "" && ClusterID ? "Edit Cluster" : "Add Cluster" }
				</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<InputGroup className="mb-2">
					<InputGroup.Text>
						Cluster Name im Panel
					</InputGroup.Text>
					<FormControl value={ Form.DisplayName } type="text" onChange={ E => setForm( Cur => ( {
						...Cur,
						DisplayName: E.target.value
					} ) ) }/>
				</InputGroup>


				<InputGroup className="mb-2">
					<InputGroup.Text>
						Server im Cluster
					</InputGroup.Text>
					<Select onChange={ setSelectedServer } className={ "flex-1" }
					        isClearable={ true }
					        isMulti={ true }
					        isOptionDisabled={ ( option ) => option.disabled === true }
					        value={ SelectedServer }
					        options={ ServerSelectOptions }
					/>
				</InputGroup>

				<InputGroup className="mb-2">
					<InputGroup.Text>
						Master Server
					</InputGroup.Text>
					<Select onChange={ setSelectedMaster } className={ "flex-1" }
					        isClearable={ false } isDisabled={ SelectedServer.length === 0 }
					        isOptionDisabled={ ( option ) => option.disabled === true || !SelectedServer.find( E => E.value === option.value ) }
					        value={ SelectedMaster }
					        options={ SelectedServer }
					/>
				</InputGroup>

				<InputGroup className="mb-2">
					<InputGroup.Text>
						Sync Konfigurationen
					</InputGroup.Text>
					<Select onChange={ setArkmanagerSync } className={ "flex-1" }
					        isClearable={ true }
					        isMulti={ true } isDisabled={ SelectedMaster?.value === "" || !SelectedMaster }
					        isOptionDisabled={ ( option ) => option.disabled === true }
					        value={ ArkmanagerSync }
					        options={ FileSync }
					/>
				</InputGroup>

				<InputGroup className="mb-2">
					<InputGroup.Text>
						Sync Arkmanager Einstellungen
					</InputGroup.Text>
					<Select onChange={ setSelectedServerSettings } className={ "flex-1" }
					        isClearable={ true }
					        isMulti={ true } isDisabled={ SelectedMaster?.value === "" || !SelectedMaster }
					        isOptionDisabled={ ( option ) => option.disabled === true }
					        value={ SelectedServerSettings }
					        options={ ServerSettingsOptions }
					/>
				</InputGroup>

				<InputGroup className="mb-2">
					<ToggleButton className={ "btn" } OnToggle={ () => setForm( Cur => ( {
						...Cur,
						NoTransferFromFiltering: !Cur.NoTransferFromFiltering
					} ) ) } Value={ Form.NoTransferFromFiltering }/>
					<InputGroup.Text className={ "flex-1" }>
						NoTransferFromFiltering
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<ToggleButton className={ "btn" } OnToggle={ () => setForm( Cur => ( {
						...Cur,
						NoTributeDownloads: !Cur.NoTributeDownloads
					} ) ) } Value={ Form.NoTributeDownloads }/>
					<InputGroup.Text className={ "flex-1" }>
						NoTributeDownloads
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<ToggleButton className={ "btn" } OnToggle={ () => setForm( Cur => ( {
						...Cur,
						PreventDownloadDinos: !Cur.PreventDownloadDinos
					} ) ) } Value={ Form.PreventDownloadDinos }/>
					<InputGroup.Text className={ "flex-1" }>
						PreventDownloadDinos
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<ToggleButton className={ "btn" } OnToggle={ () => setForm( Cur => ( {
						...Cur,
						PreventDownloadItems: !Cur.PreventDownloadItems
					} ) ) } Value={ Form.PreventDownloadItems }/>
					<InputGroup.Text className={ "flex-1" }>
						PreventDownloadItems
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<ToggleButton className={ "btn" } OnToggle={ () => setForm( Cur => ( {
						...Cur,
						PreventDownloadSurvivors: !Cur.PreventDownloadSurvivors
					} ) ) } Value={ Form.PreventDownloadSurvivors }/>
					<InputGroup.Text className={ "flex-1" }>
						PreventDownloadSurvivors
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<ToggleButton className={ "btn" } OnToggle={ () => setForm( Cur => ( {
						...Cur,
						PreventUploadDinos: !Cur.PreventUploadDinos
					} ) ) } Value={ Form.PreventUploadDinos }/>
					<InputGroup.Text className={ "flex-1" }>
						PreventUploadDinos
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<ToggleButton className={ "btn" } OnToggle={ () => setForm( Cur => ( {
						...Cur,
						PreventUploadItems: !Cur.PreventUploadItems
					} ) ) } Value={ Form.PreventUploadItems }/>
					<InputGroup.Text className={ "flex-1" }>
						PreventUploadItems
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<ToggleButton className={ "btn" } OnToggle={ () => setForm( Cur => ( {
						...Cur,
						PreventUploadSurvivors: !Cur.PreventUploadSurvivors
					} ) ) } Value={ Form.PreventUploadSurvivors }/>
					<InputGroup.Text className={ "flex-1" }>
						PreventUploadSurvivors
					</InputGroup.Text>
				</InputGroup>
			</Modal.Body>

			<Modal.Footer>
				<IconButton IsLoading={ IsSending } onClick={ Save } variant={ "success" }
				            ForceDisable={ ( !SelectedMaster || SelectedMaster.value === "" ) || Form.DisplayName === "" }>
					<FontAwesomeIcon icon={ "plus" }/> { ClusterID !== "" && ClusterID ? "Speichern" : "Erstellen" }
				</IconButton>
				<IconButton onClick={ onHide } variant={ "danger" }>
					<FontAwesomeIcon icon={ "cancel" }/> Abbrechen
				</IconButton>
			</Modal.Footer>
		</Modal>
	);
};

export default PPClusterEditor;
