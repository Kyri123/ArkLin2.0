import {
    apiAuth,
    apiHandleError,
    successSwal
} from "@app/Lib/tRPC";
import type { InputSelectMask } from "@app/Types/Systeminformation";
import { IconButton } from "@comp/Elements/Buttons";
import TableInput from "@comp/Elements/TableInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { PanelAdminLoaderProps } from "@page/app/loader/paneladmin";
import {
    useEffect,
    useId,
    useMemo,
    useState
} from "react";
import {
    Card,
    Table
} from "react-bootstrap";
import {
    useLoaderData,
    useLocation,
    useSearchParams
} from "react-router-dom";
import StringMapLib from "../../Lib/StringMap.Lib";


const CONFIGS = [ "API_BaseConfig", "Dashboard_BaseConfig", "Debug", "Tasks" ];

const Component = () => {
	const { branches } = useLoaderData() as PanelAdminLoaderProps;
	const Id = useId();
	const Location = useLocation();
	const [ ConfigData, setConfigData ] = useState<Record<string, any>>( {} );
	const [ IsSending, setIsSending ] = useState( false );
	const [ searchParams, setSearchParams ] = useSearchParams();

	const BRANCHES = useMemo( () => branches.map<InputSelectMask>( R => ( {
		Value: R.name,
		PreAndSuffix: "",
		Text: R.name
	} ) ), [ branches ] );

	const Config = useMemo( () => {
		const param = searchParams.get( "config" ) || CONFIGS[ 1 ];
		return CONFIGS.includes( param ) ? param : CONFIGS[ 1 ];
	}, [ searchParams ] );

	const SendConfig = async() => {
		setIsSending( true );

		await apiAuth.panelAdmin.setConfig.mutate( {
			file: Config,
			content: ConfigData
		} ).then( successSwal ).catch( apiHandleError );

		setIsSending( false );
	};

	useEffect( () => {
		apiAuth.panelAdmin.getConfig.query( Config ).then( setConfigData ).catch( apiHandleError );
	}, [ Config ] );

	return (
		<>
			<Card>
				<Card.Header className="d-flex p-0">
					<h3 className="card-title p-3 flex-fill">
						{ StringMapLib.nav( Location.pathname.split( "/" ).pop() as string ) } -{ " " }
						{ StringMapLib.subNav( Config ) }
						<b></b>
					</h3>
					<ul className="nav nav-pills ml-auto p-2 flex-fill">
						<li className="nav-item w-100">
							<select value={ Config }
								className="form-control w-100"
								onChange={ Event =>
									setSearchParams( { config: Event.target.value } ) }>
								{ CONFIGS.map( Value => (
									<option key={ Id + Value } value={ Value }>
										{ StringMapLib.subNav( Value ) }
									</option>
								) ) }
							</select>
						</li>
					</ul>
				</Card.Header>
				<Card.Body className="p-0">
					<Table className="p-0 m-0" striped>
						<tbody>
							{ Object.entries( ConfigData ).map( ( [ Key, Value ], Idx ) => (
								<TableInput NumMin={ 1 }
									Type={ typeof Value === "number" ? "number" : "text" }
									key={ Id + Idx }
									Value={ Value }
									onValueSet={ Value => {
										const Config = { ...ConfigData };
										Config[ Key ] = Value;
										setConfigData( Config );
									} }
									InputSelectMask={ { PANEL_Branch: BRANCHES } }
									ValueKey={ Key }>
									{ StringMapLib.config( Key ) }
								</TableInput>
							) ) }
						</tbody>
					</Table>
				</Card.Body>
				<Card.Footer>
					<IconButton Hide={ Object.keys( ConfigData ).length <= 0 }
						IsLoading={ IsSending }
						onClick={ SendConfig }>
						<FontAwesomeIcon icon="save" /> Speichern
					</IconButton>
				</Card.Footer>
			</Card>
		</>
	);
};

export { Component };
