import React, {
	useContext,
	useEffect,
	useId,
	useRef,
	useState
}                           from 'react';
import { useArkServer }     from "../../../../Hooks/useArkServer";
import {
	Card,
	FormControl,
	InputGroup,
	Table
}                           from "react-bootstrap";
import { LTELoadingButton } from "../../../../Components/Elements/AdminLTE/AdminLTE_Buttons";
import { FontAwesomeIcon }  from "@fortawesome/react-fontawesome";
import PCServerModsRow      from "../../PageComponents/Server/PCServerModsRow";
import io, { Socket }       from "socket.io-client";
import {
	IEmitEvents,
	IListenEvents
}                           from "../../../../Shared/Type/Socket";
import { SocketIOLib }      from "../../../../Lib/Api/SocketIO.Lib";
import { API_SteamAPILib }  from "../../../../Lib/Api/API_SteamAPI.Lib";
import { ISteamApiMod }     from "../../../../Shared/Api/SteamAPI";
import { API_ServerLib }    from "../../../../Lib/Api/API_Server.Lib";
import AlertContext         from "../../../../Context/AlertContext";

interface IProps {
	InstanceName : string
}

const SocketIO : Socket<IEmitEvents, IListenEvents> = io( SocketIOLib.GetSpocketHost() );
const SPServerMods : React.FunctionComponent<IProps> = ( { InstanceName } ) => {
	const { DoSetAlert } = useContext( AlertContext );
	const ID = useId();
	const { Data, TempModify } = useArkServer( InstanceName );
	const [ IsSending, setIsSending ] = useState( false );
	const InputRef = useRef<HTMLInputElement>( null );
	const [ SteamMods, setSteamMods ] = useState<Record<number, ISteamApiMod>>( {} );

	const AddMod = async( Input : string ) => {
		setIsSending( true );

		let Id = Number( Input );
		try {
			const AsUrl = new URL( Input );
			if ( AsUrl.searchParams.has( "id" ) ) {
				Id = parseInt( AsUrl.searchParams.get( "id" )! )
			}
		}
		catch ( e ) {
		}
		console.log( Id );

		if ( !isNaN( Id ) ) {
			if ( Data.ark_GameModIds.includes( Id ) ) {
				DoSetAlert( {
					Success: false,
					Auth: true,
					Message: {
						Message: `Die Mod mit der ID ${ Id } existiert bereits.`,
						Title: "Achtung!",
						AlertType: "warning"
					}
				} )
				setIsSending( false );
				return;
			}

			const CopyData = {
				...Data
			}

			CopyData.ark_GameModIds.push( Id )
			CopyData.ark_GameModIds = [ ...new Set( CopyData.ark_GameModIds ) ];
			const Result = await API_ServerLib.SetServerConfig( InstanceName, "Arkmanager.cfg", CopyData );
			if ( Result.Success ) {
				TempModify( Current => ( {
					...Current,
					ArkmanagerCfg: CopyData
				} ) );
			}
			DoSetAlert( Result );
		}
		else {
			DoSetAlert( {
				Success: false,
				Auth: true,
				Message: {
					Message: "Die eingabe war keine Nummer oder ein falscher Link!",
					Title: "Fehler!",
					AlertType: "danger"
				}
			} )
		}

		setIsSending( false );
	}


	useEffect( () => {
		const QueryMods = () => {
			API_SteamAPILib.GetMods( Data.ark_GameModIds )
				.then( setSteamMods )
		}

		QueryMods();
		SocketIO.on( "SteamApiUpdated", QueryMods );
		return () => {
			SocketIO.off( "SteamApiUpdated", QueryMods );
		}
	}, [ Data.ark_GameModIds ] )

	return (
		<Card>
			<Card.Header className={ "p-0" }>
				<h3 className="card-title p-3">
					Server Mods
				</h3>
			</Card.Header>
			<Card.Body className={ "text-dark p-0" }>
				<InputGroup>
					<FormControl className={ "rounded-0" } type="text" ref={ InputRef }></FormControl>
					<LTELoadingButton Flat IsLoading={ IsSending } BtnColor={ "success" }
									  Disabled={ InputRef.current !== null && InputRef.current.value === "" }
									  onClick={ () => {
										  if ( InputRef.current !== null && InputRef.current.value !== "" ) {
											  AddMod( InputRef.current.value );
											  InputRef.current.value = "";
										  }
									  } }>
						<FontAwesomeIcon icon={ "plus" }/>
					</LTELoadingButton>
				</InputGroup>
				<Table striped>
					<tbody>
					{ Data.ark_GameModIds.map( ( ModId, Index ) => (
						<PCServerModsRow key={ ID + ModId.toString() } InstanceName={ InstanceName }
										 ModData={ SteamMods[ ModId ] } ModId={ ModId } ModIndex={ Index }/>
					) ) }
					</tbody>
				</Table>
			</Card.Body>
		</Card>
	);
};

export default SPServerMods;
