import {
	FunctionComponent,
	useContext,
	useEffect,
	useMemo,
	useState
}                           from "react";
import {
	FormControl,
	InputGroup,
	Modal
}                           from "react-bootstrap";
import { useCluster }       from "../../../../Hooks/useCluster";
import { IMO_Cluster }      from "../../../../Types/MongoDB";
import { DefaultCluster }   from "../../../../Shared/Default/Server.Default";
import {
	LTELoadingButton,
	LTEToggleButton
}                           from "../../../Components/Elements/AdminLTE/AdminLTE_Buttons";
import { FontAwesomeIcon }  from "@fortawesome/react-fontawesome";
import Select, {
	MultiValue,
	SingleValue
}                           from "react-select";
import ServerContext        from "../../../../Context/ServerContext";
import { API_ServerLib }    from "../../../../Lib/Api/API_Server.Lib";
import { IInstanceData }    from "../../../../Shared/Type/ArkSE";
import { CAlert }           from "../General/CAlert";
import { IAPIResponseBase } from "../../../../Shared/Type/API_Response";
import { API_ClusterLib }   from "../../../../Lib/Api/API_Cluster.Lib";
import AlertContext         from "../../../../Context/AlertContext";

interface IPCClusterElementProps {
	ClusterID : string | undefined;
	Close : () => void;
}

export interface ISelectOption<T = string> {
	value : T;
	label : string;
	disabled? : boolean;
}

const DisabledOptions : ( keyof IInstanceData )[] = [
	"arkserverexec", "logdir", "arkserverroot", "arkbackupdir", "arkStagingDir", "Instance"
];

const RemovedOptions : ( keyof IInstanceData )[] = [
	"_id", "__v", "panel_publicip", "ark_Port", "ark_QueryPort", "ark_RCONPort"
];

const PPClusterEditor : FunctionComponent<IPCClusterElementProps> = ( { ClusterID, Close } ) => {
	const { DoSetAlert } = useContext( AlertContext );
	const { InstanceData } = useContext( ServerContext );
	const { Cluster, IsValid } = useCluster( ClusterID || "" );
	const [ Form, setForm ] = useState<IMO_Cluster>( { ...DefaultCluster } );
	const [ IsSending, setIsSending ] = useState<boolean>( false );

	const [ SelectedServer, setSelectedServer ] = useState<MultiValue<ISelectOption<string>>>( [] );

	const [ SelectedServerSettings, setSelectedServerSettings ] = useState<MultiValue<ISelectOption<string>>>( [] );

	// ArkmanagerSync
	const [ ArkmanagerSync, setArkmanagerSync ] = useState<MultiValue<ISelectOption<string>>>( [] );
	// Ini sync
	const [ FileSync, setFileSync ] = useState<MultiValue<ISelectOption<string>>>( [] );
	const [ SelectedMaster, setSelectedMaster ] = useState<SingleValue<ISelectOption<string>>>( null );

	const [ Response, setResponse ] = useState<IAPIResponseBase<true> | undefined>();

	const MasterServer = useMemo( () => {
		if ( SelectedMaster && SelectedMaster.value !== "" && InstanceData[ SelectedMaster.value ] ) {
			return InstanceData[ SelectedMaster.value ];
		}
		return undefined;
	}, [ SelectedMaster, InstanceData ] );

	useEffect( () => {
		const Get = async() => {
			const Options : ISelectOption<string>[] = [];

			if ( MasterServer ) {
				const Configs = await API_ServerLib.GetConfigFiles( MasterServer.Instance );
				for ( const Config of Object.keys( Configs ) ) {
					Options.push( {
						value: Config,
						label: Config
					} );
				}
			}

			return Options;
		};
		Get().then( setFileSync );
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

		const RequestData : IMO_Cluster = {
			...Form,
			Master: SelectedMaster?.value || "",
			Instances: SelectedServer.map( Instance => Instance.value ),
			SyncSettings: ArkmanagerSync.map( Instance => Instance.value ),
			SyncInis: SelectedServerSettings.map( Instance => Instance.value )
		};

		if ( RequestData.Master !== "" && ClusterID && ClusterID !== "" && IsValid ) {
			const Response = await API_ClusterLib.SetCluster( ClusterID, RequestData );

			if ( !Response.Success ) {
				setResponse( Response );
			}
			if ( Response.Success ) {
				DoSetAlert( Response );
				Close();
			}
		}
		else if ( RequestData.Master !== "" ) {
			const Response = await API_ClusterLib.CreateCluster( RequestData );

			if ( !Response.Success ) {
				setResponse( Response );
			}
			if ( Response.Success ) {
				DoSetAlert( Response );
				Close();
			}
		}

		setIsSending( false );
	};

	const ServerSettingsOptions = useMemo( () => {
		let Options : ISelectOption<string>[] = [];

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
		const options : ISelectOption<string>[] = [];
		for ( const [ Instance, Data ] of Object.entries( InstanceData ) ) {
			const IsInCluster = Data.Cluster !== null && Data.Cluster !== undefined && Data.Cluster.Instances.includes( Instance );
			options.push( {
				value: Instance,
				label: `${ Data.ArkmanagerCfg.ark_SessionName } ${ IsInCluster ? "(In einem Cluster)" : "" }`,
				disabled: IsInCluster
			} );
		}
		return options;
	}, [ InstanceData ] );

	return (
		<Modal size="lg" centered show={ ClusterID !== undefined } onHide={ Close }>
			<Modal.Header closeButton>
				<Modal.Title>
					{ ClusterID !== "" && ClusterID ? "Edit Cluster" : "Add Cluster" }
				</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<CAlert
					OnClear={ () => setResponse( undefined ) }
					Data={ Response }
				/>

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
					        options={ ServerSelectOptions }
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
					<LTEToggleButton className={ "btn" } OnToggle={ () => setForm( Cur => ( {
						...Cur,
						NoTransferFromFiltering: !Cur.NoTransferFromFiltering
					} ) ) } Value={ Form.NoTransferFromFiltering }/>
					<InputGroup.Text className={ "flex-1" }>
						NoTransferFromFiltering
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<LTEToggleButton className={ "btn" } OnToggle={ () => setForm( Cur => ( {
						...Cur,
						NoTributeDownloads: !Cur.NoTributeDownloads
					} ) ) } Value={ Form.NoTributeDownloads }/>
					<InputGroup.Text className={ "flex-1" }>
						NoTributeDownloads
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<LTEToggleButton className={ "btn" } OnToggle={ () => setForm( Cur => ( {
						...Cur,
						PreventDownloadDinos: !Cur.PreventDownloadDinos
					} ) ) } Value={ Form.PreventDownloadDinos }/>
					<InputGroup.Text className={ "flex-1" }>
						PreventDownloadDinos
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<LTEToggleButton className={ "btn" } OnToggle={ () => setForm( Cur => ( {
						...Cur,
						PreventDownloadItems: !Cur.PreventDownloadItems
					} ) ) } Value={ Form.PreventDownloadItems }/>
					<InputGroup.Text className={ "flex-1" }>
						PreventDownloadItems
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<LTEToggleButton className={ "btn" } OnToggle={ () => setForm( Cur => ( {
						...Cur,
						PreventDownloadSurvivors: !Cur.PreventDownloadSurvivors
					} ) ) } Value={ Form.PreventDownloadSurvivors }/>
					<InputGroup.Text className={ "flex-1" }>
						PreventDownloadSurvivors
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<LTEToggleButton className={ "btn" } OnToggle={ () => setForm( Cur => ( {
						...Cur,
						PreventUploadDinos: !Cur.PreventUploadDinos
					} ) ) } Value={ Form.PreventUploadDinos }/>
					<InputGroup.Text className={ "flex-1" }>
						PreventUploadDinos
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<LTEToggleButton className={ "btn" } OnToggle={ () => setForm( Cur => ( {
						...Cur,
						PreventUploadItems: !Cur.PreventUploadItems
					} ) ) } Value={ Form.PreventUploadItems }/>
					<InputGroup.Text className={ "flex-1" }>
						PreventUploadItems
					</InputGroup.Text>
				</InputGroup>

				<InputGroup className="mb-2">
					<LTEToggleButton className={ "btn" } OnToggle={ () => setForm( Cur => ( {
						...Cur,
						PreventUploadSurvivors: !Cur.PreventUploadSurvivors
					} ) ) } Value={ Form.PreventUploadSurvivors }/>
					<InputGroup.Text className={ "flex-1" }>
						PreventUploadSurvivors
					</InputGroup.Text>
				</InputGroup>
			</Modal.Body>

			<Modal.Footer>
				<LTELoadingButton IsLoading={ IsSending } onClick={ Save } variant={ "success" }
				                  ForceDisable={ ( !SelectedMaster || SelectedMaster.value === "" ) || Form.DisplayName === "" }>
					<FontAwesomeIcon icon={ "plus" }/> { ClusterID !== "" && ClusterID ? "Speichern" : "Erstellen" }
				</LTELoadingButton>
				<LTELoadingButton onClick={ Close } variant={ "danger" }>
					<FontAwesomeIcon icon={ "cancel" }/> Abbrechen
				</LTELoadingButton>
			</Modal.Footer>
		</Modal>
	);
};

export default PPClusterEditor;
