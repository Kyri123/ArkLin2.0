import {
	apiAuth,
	apiHandleError,
	fireSwalFromApi
} from "@app/Lib/tRPC";
import type { InstanceData } from "@app/Types/ArkSE";
import type { SelectOption } from "@app/Types/Systeminformation";
import {
	IconButton,
	ToggleButton
} from "@comp/Elements/Buttons";
import ServerContext from "@context/ServerContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCluster } from "@hooks/useCluster";
import type { Cluster } from "@server/MongoDB/MongoCluster";
import { defaultCluster } from "@shared/Default/Server.Default";
import type { FunctionComponent } from "react";
import {
	useContext,
	useEffect,
	useMemo,
	useState
} from "react";
import {
	FormControl,
	InputGroup,
	Modal
} from "react-bootstrap";
import type {
	MultiValue,
	SingleValue
} from "react-select";
import Select from "react-select";


interface IPCClusterElementProps {
	show: boolean,
	clusterID?: string,
	onHide: () => void,
	refresh: () => void
}

const disabledOptions: ( keyof InstanceData )[] = [
	"arkserverexec", "logdir", "arkserverroot", "arkbackupdir", "arkStagingDir", " instance"
];

const removedOptions: ( keyof InstanceData )[] = [
	"_id", "__v", "panel_publicip", "ark_Port", "ark_QueryPort", "ark_RCONPort"
];

const PPClusterEditor: FunctionComponent<IPCClusterElementProps> = ( { clusterID, onHide, show, refresh } ) => {
	const { instanceData } = useContext( ServerContext );
	const { cluster, isValid } = useCluster( clusterID || "" );
	const [ form, setForm ] = useState<Cluster>( { ...defaultCluster } );
	const [ isSending, setIsSending ] = useState<boolean>( false );
	const [ selectedServer, setSelectedServer ] = useState<MultiValue<SelectOption>>( [] );
	const [ selectedServerSettings, setSelectedServerSettings ] = useState<MultiValue<SelectOption>>( [] );

	// arkmanagerSync
	const [ arkmanagerSync, setArkmanagerSync ] = useState<MultiValue<SelectOption>>( [] );
	// Ini sync
	const [ fileSync, setFileSync ] = useState<MultiValue<SelectOption>>( [] );
	const [ selectedMaster, setSelectedMaster ] = useState<SingleValue<SelectOption>>( null );

	const masterServer = useMemo( () => {
		if( selectedMaster && selectedMaster.value !== "" && instanceData[ selectedMaster.value ] ) {
			return instanceData[ selectedMaster.value ];
		}
		return undefined;
	}, [ selectedMaster, instanceData ] );

	useEffect( () => {
		if( masterServer ) {
			setFileSync( ( masterServer?.State.allConfigs || [] ).map<SelectOption>( e => ( {
				label: e,
				value: e
			} ) ) );
		} else {
			setFileSync( [] );
		}
	}, [ masterServer ] );

	useEffect( () => {
		if( !selectedServer ) {
			return;
		}

		if( selectedServer.length === 0 && selectedMaster?.value !== "" ) {
			setSelectedMaster( () => ( { value: "", label: "" } ) );
			setArkmanagerSync( () => [] );
			setSelectedServerSettings( () => [] );
		}

		if( ( selectedMaster?.value === "" ) && selectedServer.length !== 0 ) {
			setSelectedMaster( () => selectedServer[ 0 ] );
		}

		if( selectedServer.find( E => E.value === selectedMaster!.value ) === undefined && selectedServer.length !== 0 ) {
			setSelectedMaster( () => selectedServer[ 0 ] );
		}
	}, [ selectedServer, selectedMaster, clusterID ] );

	useEffect( () => {
		if( !isValid ) {
			return;
		}
		setForm( () => isValid ? { ...cluster } : { ...defaultCluster } );
		setSelectedServer( () => isValid ? cluster.Instances.map(  instance => {
			if( instanceData[  instance ] ) {
				return {
					value: instance,
					label: instanceData[  instance ].ArkmanagerCfg.ark_SessionName
				};
			}
			return {
				value: instance,
				label: instance
			};
		} ) : [] );
		setSelectedServerSettings( () => cluster.SyncInis.map( E => ( { label: E, value: E } ) ) );
		setArkmanagerSync( () => cluster.SyncSettings.map( E => ( { label: E, value: E } ) ) );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ clusterID, isValid ] );

	const save = async() => {
		setIsSending( true );

		const data: Cluster = {
			...form,
			Master: selectedMaster?.value || "",
			Instances: selectedServer.map(  instance =>  instance.value ),
			SyncSettings: arkmanagerSync.map(  instance =>  instance.value ),
			SyncInis: selectedServerSettings.map(  instance =>  instance.value )
		};

		if( isValid && !!clusterID ) {
			setIsSending( true );
			const result = await apiAuth.server.clusterManagement.editCluster.mutate( {
				id: clusterID!,
				data
			} ).catch( apiHandleError );
			if( result ) {
				await refresh();
				onHide();
				fireSwalFromApi( result, true );
			}
			setIsSending( false );
		} else {
			setIsSending( true );
			const result = await apiAuth.server.clusterManagement.createCluster.mutate( { data } ).catch( apiHandleError );
			if( result ) {
				await refresh();
				onHide();
				fireSwalFromApi( result, true );
			}
			setIsSending( false );
		}

		setIsSending( false );
	};

	const serverSettingsOptions = useMemo( () => {
		let options: SelectOption[] = [];

		if( masterServer ) {
			options = Object.keys( masterServer.ArkmanagerCfg ).filter( E => !removedOptions.includes( E ) ).map( Key => ( {
				label: Key,
				value: Key,
				disabled: disabledOptions.includes( Key )
			} ) );
		}

		return options;
	}, [ masterServer ] );

	const serverSelectOptions = useMemo( () => {
		const options: SelectOption[] = [];
		for( const [  instance, data ] of Object.entries( instanceData ) ) {
			const isInCluster = !!data.cluster && data.cluster?.Instances.includes(  instance );
			options.push( {
				value: instance,
				label: `${ data.ArkmanagerCfg.ark_SessionName } ${ isInCluster ? "(In einemcluster)" : "" }`,
				disabled: isInCluster
			} );
		}
		return options;
	}, [ instanceData ] );

	return (
		<Modal size="lg" centered show={ show } onHide={ onHide }>
			<Modal.Header closeButton>
				<Modal.Title>
					{ clusterID !== "" && clusterID ? "Editcluster" : "Addcluster" }
				</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<InputGroup className="mb-2">
					<InputGroup.Text>
						Cluster Name im Panel
					</InputGroup.Text>
					<FormControl value={ form.DisplayName } type="text" onChange={ E => setForm( Cur => ( {
						...Cur,
						DisplayName: E.target.value
					} ) ) } />
				</InputGroup>


				<InputGroup className="mb-2">
					<InputGroup.Text>
						Server imcluster
					</InputGroup.Text>
					<Select onChange={ setSelectedServer } className="flex-1"
					        isClearable={ true }
					        isMulti={ true }
					        isOptionDisabled={ option => option.disabled === true }
					        value={ selectedServer }
					        options={ serverSelectOptions } />
				</InputGroup>

				<InputGroup className="mb-2">
					<InputGroup.Text>
						Master Server
					</InputGroup.Text>
					<Select onChange={ setSelectedMaster } className="flex-1"
					        isClearable={ false } isDisabled={ selectedServer.length === 0 }
					        isOptionDisabled={ option => option.disabled === true || !selectedServer.find( E => E.value === option.value ) }
					        value={ selectedMaster }
					        options={ selectedServer } />
				</InputGroup>

				<InputGroup className="mb-2">
					<InputGroup.Text>
						Sync Konfigurationen
					</InputGroup.Text>
					<Select onChange={ setArkmanagerSync } className="flex-1"
					        isClearable={ true }
					        isMulti={ true } isDisabled={ selectedMaster?.value === "" || !selectedMaster }
					        isOptionDisabled={ option => option.disabled === true }
					        value={ arkmanagerSync }
					        options={ fileSync } />
				</InputGroup>

				<InputGroup className="mb-2">
					<InputGroup.Text>
						Sync Arkmanager Einstellungen
					</InputGroup.Text>
					<Select onChange={ setSelectedServerSettings } className="flex-1"
					        isClearable={ true }
					        isMulti={ true } isDisabled={ selectedMaster?.value === "" || !selectedMaster }
					        isOptionDisabled={ option => option.disabled === true }
					        value={ selectedServerSettings }
					        options={ serverSettingsOptions } />
				</InputGroup>

				<InputGroup className="mb-2">
					<ToggleButton className="btn" onToggle={ () => setForm( Cur => ( {
						...Cur,
						NoTransferFromFiltering: !Cur.NoTransferFromFiltering
					} ) ) } Value={ form.NoTransferFromFiltering } />
					<InputGroup.Text className="flex-1">
						NoTransferFromFiltering
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<ToggleButton className="btn" onToggle={ () => setForm( Cur => ( {
						...Cur,
						NoTributeDownloads: !Cur.NoTributeDownloads
					} ) ) } Value={ form.NoTributeDownloads } />
					<InputGroup.Text className="flex-1">
						NoTributeDownloads
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<ToggleButton className="btn" onToggle={ () => setForm( Cur => ( {
						...Cur,
						PreventDownloadDinos: !Cur.PreventDownloadDinos
					} ) ) } Value={ form.PreventDownloadDinos } />
					<InputGroup.Text className="flex-1">
						PreventDownloadDinos
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<ToggleButton className="btn" onToggle={ () => setForm( Cur => ( {
						...Cur,
						PreventDownloadItems: !Cur.PreventDownloadItems
					} ) ) } Value={ form.PreventDownloadItems } />
					<InputGroup.Text className="flex-1">
						PreventDownloadItems
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<ToggleButton className="btn" onToggle={ () => setForm( Cur => ( {
						...Cur,
						PreventDownloadSurvivors: !Cur.PreventDownloadSurvivors
					} ) ) } Value={ form.PreventDownloadSurvivors } />
					<InputGroup.Text className="flex-1">
						PreventDownloadSurvivors
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<ToggleButton className="btn" onToggle={ () => setForm( Cur => ( {
						...Cur,
						PreventUploadDinos: !Cur.PreventUploadDinos
					} ) ) } Value={ form.PreventUploadDinos } />
					<InputGroup.Text className="flex-1">
						PreventUploadDinos
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<ToggleButton className="btn" onToggle={ () => setForm( Cur => ( {
						...Cur,
						PreventUploadItems: !Cur.PreventUploadItems
					} ) ) } Value={ form.PreventUploadItems } />
					<InputGroup.Text className="flex-1">
						PreventUploadItems
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<ToggleButton className="btn" onToggle={ () => setForm( Cur => ( {
						...Cur,
						PreventUploadSurvivors: !Cur.PreventUploadSurvivors
					} ) ) } Value={ form.PreventUploadSurvivors } />
					<InputGroup.Text className="flex-1">
						PreventUploadSurvivors
					</InputGroup.Text>
				</InputGroup>
			</Modal.Body>

			<Modal.Footer>
				<IconButton IsLoading={ isSending } onClick={ save } variant="success"
				            ForceDisable={ ( !selectedMaster || selectedMaster.value === "" ) || form.DisplayName === "" }>
					<FontAwesomeIcon icon="plus" /> { clusterID !== "" && clusterID ? "Speichern" : "Erstellen" }
				</IconButton>
				<IconButton onClick={ onHide } variant="danger">
					<FontAwesomeIcon icon="cancel" /> Abbrechen
				</IconButton>
			</Modal.Footer>
		</Modal>
	);
};

export default PPClusterEditor;
