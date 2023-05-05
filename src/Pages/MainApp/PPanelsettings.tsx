import {
	useEffect,
	useId,
	useState
}                                               from "react";
import { EPerm }                                from "@shared/Enum/User.Enum";
import {
	useLocation,
	useSearchParams
}                                               from "react-router-dom";
import { API_PanelLib }                         from "@app/Lib/Api/API_Panel.Lib";
import { Card }                                 from "react-bootstrap";
import CLTEInput                                from "../../Components/Elements/AdminLTE/AdminLTE_Inputs";
import { IconButton }                           from "@comp/Elements/AdminLTE/Buttons";
import { FontAwesomeIcon }                      from "@fortawesome/react-fontawesome";
import StringMapLib                             from "../../Lib/StringMap.Lib";
import { API_QueryLib }                         from "@app/Lib/Api/API_Query.Lib";
import { EChangelogUrl }                        from "@shared/Enum/Routing";
import type { TResponse_Changelog_GetBranches } from "@app/Types/API_Response";
import type { InputSelectMask }                 from "@app/Types/Systeminformation";

const CONFIGS = [ "API_BaseConfig", "Dashboard_BaseConfig", "Debug", "Tasks" ];

export default function PPanelsettings() {
	const Id = useId();
	const Location = useLocation();
	const [ ConfigData, setConfigData ] = useState<Record<string, any>>( {} );
	const [ IsSending, setIsSending ] = useState( false );
	const [ searchParams, setSearchParams ] = useSearchParams();
	const [ BRANCHES, setBRANCHES ] = useState<InputSelectMask[]>( [] );
	usePermissionPage( EPerm.PanelSettings );

	useEffect( () => {
		let Config = searchParams.get( "config" ) || CONFIGS[ 1 ];
		if ( !CONFIGS.find( ( e ) => e === Config ) ) {
			Config = CONFIGS[ 1 ];
		}
		API_PanelLib.GetConfig( Config ).then( setConfigData );
		API_QueryLib.GetFromAPI<TResponse_Changelog_GetBranches>( EChangelogUrl.branches ).then(
			( Data ) => {
				if ( Data.Data ) {
					setBRANCHES(
						Data.Data.map<InputSelectMask>( ( R ) => ( {
							Value: R.name,
							PreAndSuffix: "",
							Text: R.name
						} ) )
					);
				}
			}
		);
	}, [ searchParams ] );

	const SendConfig = async() => {
		setIsSending( true );

		let Config = searchParams.get( "config" ) || CONFIGS[ 1 ];
		if ( !CONFIGS.find( ( e ) => e === Config ) ) {
			Config = CONFIGS[ 1 ];
		}
		GAlert.DoSetAlert( await API_PanelLib.SetConfig( Config, ConfigData ) );

		setIsSending( false );
	};

	let Config = searchParams.get( "config" ) || CONFIGS[ 1 ];
	if ( !CONFIGS.find( ( e ) => e === Config ) ) {
		Config = CONFIGS[ 1 ];
	}

	return (
		<>
			<Card>
				<Card.Header className="d-flex p-0">
					<h3 className="card-title p-3 flex-fill">
						{ StringMapLib.Nav( Location.pathname.split( "/" ).pop() as string ) } -{ " " }
						{ StringMapLib.SubNav( Config ) }
						<b></b>
					</h3>
					<ul className="nav nav-pills ml-auto p-2 flex-fill">
						<li className="nav-item w-100">
							<select
								value={ Config }
								className="form-control w-100"
								onChange={ ( Event ) =>
									setSearchParams( { config: Event.target.value } )
								}
							>
								{ CONFIGS.map( ( Value ) => (
									<option key={ Id + Value } value={ Value }>
										{ StringMapLib.SubNav( Value ) }
									</option>
								) ) }
							</select>
						</li>
					</ul>
				</Card.Header>
				<Card.Body>
					{ Object.entries( ConfigData ).map( ( [ Key, Value ], Idx ) => (
						<CLTEInput
							NumMin={ 1 }
							Type={ typeof Value === "number" ? "number" : "text" }
							key={ Id + Idx }
							Value={ Value }
							OnValueSet={ ( Value ) => {
								const Config = { ...ConfigData };
								Config[ Key ] = Value;
								setConfigData( Config );
							} }
							InputSelectMask={ { PANEL_Branch: BRANCHES } }
							ValueKey={ Key }
						>
							{ StringMapLib.Config( Key ) }
						</CLTEInput>
					) ) }
				</Card.Body>
				<Card.Footer>
					<IconButton
						Hide={ Object.keys( ConfigData ).length <= 0 }
						IsLoading={ IsSending }
						onClick={ SendConfig }
					>
						<FontAwesomeIcon icon={ "save" }/> Speichern
					</IconButton>
				</Card.Footer>
			</Card>
		</>
	);
}
