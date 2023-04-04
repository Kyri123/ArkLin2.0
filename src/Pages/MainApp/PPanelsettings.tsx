import {
	useContext,
	useEffect,
	useId,
	useState
}                                 from "react";
import { EPerm }                  from "../../Shared/Enum/User.Enum";
import {
	useLocation,
	useSearchParams
}                                 from "react-router-dom";
import { API_PanelLib }           from "../../Lib/Api/API_Panel.Lib";
import { Card }                   from "react-bootstrap";
import CLTEInput, { ISelectMask } from "../../Components/Elements/AdminLTE/AdminLTE_Inputs";
import { LTELoadingButton }       from "../../Components/Elements/AdminLTE/AdminLTE_Buttons";
import { FontAwesomeIcon }        from "@fortawesome/react-fontawesome";
import StringMapLib               from "../../Lib/StringMap.Lib";
import usePermissionPage          from "../../Hooks/usePermissionPage";
import AlertContext               from "../../Context/AlertContext";

const CONFIGS = [
	"API_BaseConfig",
	"Dashboard_BaseConfig",
	"Debug",
	"Tasks"
]

const BRANCHES : ISelectMask[] = [
	{ Value: "main", Text: "Main", PreAndSuffix: '' },
	{ Value: "dev", Text: "Development", PreAndSuffix: '' },
	{ Value: "test", Text: "Testing", PreAndSuffix: '' },
	{ Value: "2.0.0-Typescript", Text: "Typescript Dev", PreAndSuffix: '' }
]

export default function PPanelsettings() {
	const GAlert = useContext( AlertContext );
	const Id = useId();
	const Location = useLocation();
	const [ ConfigData, setConfigData ] = useState<Record<string, any>>( {} );
	const [ IsSending, setIsSending ] = useState( false );
	const [ searchParams, setSearchParams ] = useSearchParams();
	usePermissionPage( EPerm.PanelSettings )

	useEffect( () => {
		let Config = searchParams.get( "config" ) || CONFIGS[ 1 ];
		if ( !CONFIGS.find( e => e === Config ) ) {
			Config = CONFIGS[ 1 ];
		}
		API_PanelLib.GetConfig( Config ).then( setConfigData );
	}, [ searchParams ] );

	const SendConfig = async() => {
		setIsSending( true );

		let Config = searchParams.get( "config" ) || CONFIGS[ 1 ];
		if ( !CONFIGS.find( e => e === Config ) ) {
			Config = CONFIGS[ 1 ];
		}
		GAlert.DoSetAlert( await API_PanelLib.SetConfig( Config, ConfigData ) );

		setIsSending( false );
	}

	let Config = searchParams.get( "config" ) || CONFIGS[ 1 ];
	if ( !CONFIGS.find( e => e === Config ) ) {
		Config = CONFIGS[ 1 ];
	}

	return (
		<>
			<Card>
				<Card.Header className="d-flex p-0">
					<h3 className="card-title p-3">{ StringMapLib.Nav( Location.pathname.split( "/" ).pop() as string ) } - { StringMapLib.SubNav( Config ) }<b></b>
					</h3>
					<ul className="nav nav-pills ml-auto p-2">
						<li className="nav-item">
							<select value={ Config } className="form-control"
									onChange={ Event => setSearchParams( { config: Event.target.value } ) }>
								{ CONFIGS.map( ( Value ) => (
									<option key={ Id + Value } value={ Value }>{ StringMapLib.SubNav( Value ) }</option>
								) ) }
							</select>
						</li>
					</ul>
				</Card.Header>
				<Card.Body>
					{ Object.entries( ConfigData ).map( ( [ Key, Value ], Idx ) => (
						<CLTEInput NumMin={ 1 } Type={ typeof Value === "number" ? "number" : "text" } key={ Id + Idx }
								   Value={ Value } OnValueSet={ Value => {
							const Config = { ...ConfigData };
							Config[ Key ] = Value;
							setConfigData( Config );
						} } SelectMask={ { "PANEL_Branch": BRANCHES } }
								   ValueKey={ Key }>{ StringMapLib.Config( Key ) }</CLTEInput>
					) ) }
				</Card.Body>
				<Card.Footer>
					<LTELoadingButton Hide={ Object.keys( ConfigData ).length <= 0 } IsLoading={ IsSending }
									  onClick={ SendConfig }>
						<FontAwesomeIcon icon={ "save" }/> Speichern
					</LTELoadingButton>
				</Card.Footer>
			</Card>
		</>
	)
}