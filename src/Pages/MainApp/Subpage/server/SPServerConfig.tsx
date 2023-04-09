import React, {
	useContext,
	useEffect,
	useState
}                              from "react";
import { useArkServerConfigs } from "../../../../Hooks/useArkServerConfigs";
import {
	Alert,
	ButtonGroup,
	Card,
	Col,
	FormControl,
	Nav,
	Row
}                              from "react-bootstrap";
import Select, { SingleValue } from "react-select";
import CLTEInput               from "../../../Components/Elements/AdminLTE/AdminLTE_Inputs";
import { LTELoadingButton }    from "../../../Components/Elements/AdminLTE/AdminLTE_Buttons";
import { useToggle }           from "@kyri123/k-reactutils";
import { FontAwesomeIcon }     from "@fortawesome/react-fontawesome";
import * as ini                from "ini";
import CodeMirror              from "@uiw/react-codemirror";
import { json }                from "@codemirror/lang-json";
import {
	defaultSettingsGruvboxDark,
	gruvboxDarkInit
}                              from "@uiw/codemirror-theme-gruvbox-dark";
import { API_ServerLib }       from "../../../../Lib/Api/API_Server.Lib";
import AlertContext            from "../../../../Context/AlertContext";

interface IProps {
	InstanceName : string;
}

const SPServerConfig : React.FunctionComponent<IProps> = ( { InstanceName } ) => {
	const { DoSetAlert } = useContext( AlertContext );
	const {
		RequestConfigContent,
		ConfigFiles,
		ConfigContent,
		CurrentFile,
		Init
	} = useArkServerConfigs( InstanceName );
	const [ FormIni, setFormIni ] = useState<Record<string, any>>( {} );
	const [ SelectedSection, setSelectedSection ] = useState<string | undefined>(
		undefined
	);
	const [ UseTextEdtior, ToggleTextEditor ] = useToggle( true );
	const [ TextEdtiorContent, setTextEdtiorContent ] = useState( "" );
	const [ JsonError, setJsonError ] = useState( "" );
	const [ IsSending, setIsSending ] = useState( false );

	useEffect( () => {
		setTextEdtiorContent( () =>
			CurrentFile.toLowerCase() === "arkmanager.cfg"
				? JSON.stringify( ConfigContent, null, 4 )
				: ini.stringify( ConfigContent )
		);
		setFormIni( () => ConfigContent );
	}, [ ConfigContent, CurrentFile ] );

	useEffect( () => {
		setTextEdtiorContent( () =>
			IsArkmanagerCfg()
				? JSON.stringify( FormIni, null, 4 )
				: ini.stringify( FormIni )
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ UseTextEdtior ] );

	const GetOptions = () => {
		const Return : { value : string; label : string }[] = [];
		for ( const [ FilePath, File ] of Object.entries( ConfigFiles ) ) {
			Return.push( {
				value: File,
				label: FilePath
			} );
		}
		return Return;
	};

	const SetOption = (
		NewValue : SingleValue<{ value : string; label : string }>
	) => {
		if ( NewValue ) {
			RequestConfigContent( NewValue.value );
		}
	};

	const IsArkmanagerCfg = () => {
		return CurrentFile.toLowerCase() === "Arkmanager.cfg".toLowerCase();
	};

	const GetSectionObject = () : Record<string, string> => {
		const SectionA = SelectedSection?.split( "." )[ 0 ];
		const SectionB = SelectedSection?.split( "." )[ 1 ];
		if ( SectionB && FormIni[ SectionA || "" ] ) {
			return FormIni[ SectionA || "" ][ SectionB ] || {};
		}
		return FormIni[ SectionA || "" ] || {};
	};

	if ( !Init ) {
		return <></>;
	}

	const SaveConfig = async() => {
		setIsSending( true );

		const Response = await API_ServerLib.SetServerConfig(
			InstanceName,
			CurrentFile,
			FormIni
		);
		DoSetAlert( Response );

		setIsSending( false );
	};

	return (
		<Card>
			<Card.Header className={ "p-0" }>
				<div className="d-flex bd-highlight w-100">
					<div className="p-0 flex-grow-1 bd-highlight">
						<h3 className="card-title p-3">Server Konfiguration</h3>
					</div>
					<div className="p-2 flex-grow-1 bd-highlight">
						<Select
							className={ "w-100" }
							options={ GetOptions() }
							value={ {
								value: CurrentFile || "",
								label: CurrentFile.split( "/" ).pop() || ""
							} }
							onChange={ SetOption }
						/>
					</div>
				</div>
			</Card.Header>
			<Card.Header className={ "p-0" }>
				<ButtonGroup className={ "w-100" }>
					<LTELoadingButton
						IsLoading={ IsSending }
						className={ "flat" }
						onClick={ SaveConfig }
						variant={ "success" }
					>
						<FontAwesomeIcon icon={ "save" }/> Speichern{ " " }
					</LTELoadingButton>
					<LTELoadingButton className={ "flat" } onClick={ ToggleTextEditor }>
						{ " " }
						{ UseTextEdtior ? "Benutze Editor" : "Benutze Text Editor" }{ " " }
					</LTELoadingButton>
				</ButtonGroup>
				{ JsonError !== "" && (
					<Alert
						variant="danger"
						onClose={ () => setJsonError( "" ) }
						dismissible
						className={ "rounded-0 m-0" }
					>
						<FontAwesomeIcon
							icon={ "exclamation-triangle" }
							className={ "icon" }
							size={ "xl" }
						/>{ " " }
						Wurde nicht gespeichert. Error wurde erkannt...
						<hr/> <b>{ JsonError }</b>
					</Alert>
				) }
			</Card.Header>
			{ UseTextEdtior ? (
				<>
					<Card.Body className={ "text-light p-0" } style={ { height: 750 } }>
						<CodeMirror
							height={ "750px" }
							theme={ gruvboxDarkInit( {
								settings: {
									...defaultSettingsGruvboxDark
								}
							} ) }
							className={ "h-100" }
							value={ TextEdtiorContent }
							extensions={ [ json() ] }
							onChange={ ( value ) => {
								setTextEdtiorContent( value );
								try {
									const Ini = IsArkmanagerCfg()
										? JSON.parse( value )
										: ini.decode( value );
									setFormIni( Ini );
									setJsonError( "" );
								}
								catch ( e ) {
									setJsonError( ( e as Error ).message );
								}
							} }
						/>
					</Card.Body>
				</>
			) : (
				<Card.Body
					className={ "text-light p-0" }
					style={ { overflowX: "hidden", overflowY: "scroll", height: 750 } }
				>
					<Row className={ "h-100" }>
						{ !IsArkmanagerCfg() && (
							<Col md={ 3 } className={ "pe-0 me-0" }>
								<Nav className="nav flex-column nav-tabs h-100">
									{ Object.entries( FormIni ).map( ( [ Key, Content ] ) => {
										let SetKey = Key;
										if ( typeof Object.values( Content )[ 0 ] === "object" ) {
											SetKey += "." + Object.keys( Content )[ 0 ];
										}
										return (
											<Nav.Link
												key={ Key }
												onClick={ () => setSelectedSection( SetKey ) }
											>
												{ SetKey }
											</Nav.Link>
										);
									} ) }
								</Nav>
							</Col>
						) }
						<Col md={ IsArkmanagerCfg() ? 12 : 9 } className={ "p-0" }>
							{ !IsArkmanagerCfg() && (
								<table className={ "table table-striped m-0" }>
									<tbody>
									{ Object.entries( GetSectionObject() ).map( ( [ Key, Value ] ) => {
										return (
											<tr key={ Key } className={ "text-dark" }>
												<td style={ { width: "30%" } }>{ Key }</td>
												<td style={ { width: "70%" } }>
													<FormControl
														value={ Value.toString() }
														onChange={ ( Event ) =>
															setFormIni( ( Current ) => {
																const NewValue = Event.target.value;
																let Section =
																	Current[
																	SelectedSection?.split( "." )[ 0 ] || ""
																		];
																if ( SelectedSection?.split( "." )[ 1 ] ) {
																	let SubSection =
																		Section[
																		SelectedSection?.split( "." )[ 1 ] || ""
																			];

																	SubSection = {
																		...SubSection,
																		[ Key ]: NewValue
																	};

																	Section = {
																		...Section,
																		[ SelectedSection?.split( "." )[ 1 ] || "" ]:
																		SubSection
																	};
																}
																else {
																	Section = {
																		...Section,
																		[ Key ]: NewValue
																	};
																}

																return {
																	...Current,
																	[ SelectedSection?.split( "." )[ 0 ] || "" ]:
																	Section
																};
															} )
														}
													/>
												</td>
											</tr>
										);
									} ) }
									</tbody>
								</table>
							) }

							{ IsArkmanagerCfg() && (
								<table className={ "table table-striped m-0" }>
									<tbody>
									{ Object.entries( FormIni ).map( ( [ Key, Value ], Idx ) => {
										if ( typeof Value === "object" && !Array.isArray( Value ) ) {
											return undefined;
										}

										return (
											<tr key={ Key + Idx }>
												<td className={ "text-dark pt-2 ps-4 pe-4" }>
													<CLTEInput
														className={ "m-0" }
														Value={ Value }
														OnValueSet={ ( Value ) =>
															setFormIni( ( Current ) => ( {
																...Current,
																[ Key ]: Value
															} ) )
														}
														ValueKey={ Key }
														SelectMask={ {} }
													>
														{ " " }
														{ Key }{ " " }
													</CLTEInput>
												</td>
											</tr>
										);
									} ) }
									</tbody>
								</table>
							) }
						</Col>
					</Row>
				</Card.Body>
			) }
		</Card>
	);
};

export default SPServerConfig;
