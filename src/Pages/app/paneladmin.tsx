import {
	useEffect,
	useId,
	useMemo,
	useState
}                                     from "react";
import {
	useLoaderData,
	useLocation,
	useSearchParams
}                                     from "react-router-dom";
import {
	Card,
	Table
}                                     from "react-bootstrap";
import { IconButton }                 from "@comp/Elements/AdminLTE/Buttons";
import { FontAwesomeIcon }            from "@fortawesome/react-fontawesome";
import StringMapLib                   from "../../Lib/StringMap.Lib";
import type { InputSelectMask }       from "@app/Types/Systeminformation";
import type { PanelAdminLoaderProps } from "@page/app/loader/paneladmin";
import {
	successSwal,
	tRPC_Auth,
	tRPC_handleError
}                                     from "@app/Lib/tRPC";
import TableInput                     from "@comp/Elements/AdminLTE/TableInput";

const CONFIGS = [ "API_BaseConfig", "Dashboard_BaseConfig", "Debug", "Tasks" ];

const Component = () => {
	const { branches } = useLoaderData() as PanelAdminLoaderProps;
	const Id = useId();
	const Location = useLocation();
	const [ ConfigData, setConfigData ] = useState<Record<string, any>>( {} );
	const [ IsSending, setIsSending ] = useState( false );
	const [ searchParams, setSearchParams ] = useSearchParams();

	const BRANCHES = useMemo( () => {
		return branches.map<InputSelectMask>( ( R ) => ( {
			Value: R.name,
			PreAndSuffix: "",
			Text: R.name
		} ) );
	}, [ branches ] );

	const Config = useMemo( () => {
		const param = searchParams.get( "config" ) || CONFIGS[ 1 ];
		return CONFIGS.includes( param ) ? param : CONFIGS[ 1 ];
	}, [ searchParams ] );

	const SendConfig = async() => {
		setIsSending( true );

		await tRPC_Auth.panelAdmin.setConfig.mutate( {
			file: Config,
			content: ConfigData
		} ).then( successSwal ).catch( tRPC_handleError );

		setIsSending( false );
	};

	useEffect( () => {
		tRPC_Auth.panelAdmin.getConfig.query( Config ).then( setConfigData ).catch( tRPC_handleError );
	}, [ Config ] );

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
				<Card.Body className="p-0">
					<Table className="p-0 m-0" striped>
						<tbody>
						{ Object.entries( ConfigData ).map( ( [ Key, Value ], Idx ) => (
							<TableInput
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
							</TableInput>
						) ) }
						</tbody>
					</Table>
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
};

export { Component };