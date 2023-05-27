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
	const id = useId();
	const { pathname } = useLocation();
	const [ configData, setConfigData ] = useState<Record<string, any>>( {} );
	const [ isSending, setIsSending ] = useState( false );
	const [ searchParams, setSearchParams ] = useSearchParams();

	const BRANCHES = useMemo( () => branches.map<InputSelectMask>( R => ( {
		Value: R.name,
		PreAndSuffix: "",
		Text: R.name
	} ) ), [ branches ] );

	const config = useMemo( () => {
		const param = searchParams.get( "config" ) || CONFIGS[ 1 ];
		return CONFIGS.includes( param ) ? param : CONFIGS[ 1 ];
	}, [ searchParams ] );

	const sendConfig = async() => {
		setIsSending( true );

		await apiAuth.panelAdmin.setConfig.mutate( {
			file: config,
			content: configData
		} ).then( successSwal ).catch( apiHandleError );

		setIsSending( false );
	};

	useEffect( () => {
		apiAuth.panelAdmin.getConfig.query( config ).then( setConfigData ).catch( apiHandleError );
	}, [ config ] );

	return (
		<>
			<Card>
				<Card.Header className="d-flex p-0">
					<h3 className="card-title p-3 flex-fill">
						{ StringMapLib.nav( pathname.split( "/" ).pop() as string ) } -{ " " }
						{ StringMapLib.subNav( config ) }
						<b></b>
					</h3>
					<ul className="nav nav-pills ml-auto p-2 flex-fill">
						<li className="nav-item w-100">
							<select value={ config }
								className="form-control w-100"
								onChange={ Event =>
									setSearchParams( { config: Event.target.value } ) }>
								{ CONFIGS.map( Value => (
									<option key={ id + Value } value={ Value }>
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
							{ Object.entries( configData ).map( ( [ Key, Value ], Idx ) => (
								<TableInput NumMin={ 1 }
									Type={ typeof Value === "number" ? "number" : "text" }
									key={ id + Idx }
									Value={ Value }
									onValueSet={ Value => {
										const config = { ...configData };
										config[ Key ] = Value;
										setConfigData( config );
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
					<IconButton Hide={ Object.keys( configData ).length <= 0 }
						IsLoading={ isSending }
						onClick={ sendConfig }>
						<FontAwesomeIcon icon="save" /> Speichern
					</IconButton>
				</Card.Footer>
			</Card>
		</>
	);
};

export { Component };

