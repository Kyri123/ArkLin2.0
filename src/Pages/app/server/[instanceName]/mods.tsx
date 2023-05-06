import type React            from "react";
import {
	useEffect,
	useId,
	useRef,
	useState
}                            from "react";
import { useArkServer }      from "@hooks/useArkServer";
import {
	Card,
	FormControl,
	InputGroup,
	Table
}                            from "react-bootstrap";
import { IconButton }        from "@comp/Elements/Buttons";
import { FontAwesomeIcon }   from "@fortawesome/react-fontawesome";
import PCServerModsRow       from "../../pageComponents/server/PCServerModsRow";
import type { Socket }       from "socket.io-client";
import io                    from "socket.io-client";
import { SocketIOLib }       from "@app/Lib/Api/SocketIO.Lib";
import type { ISteamApiMod } from "@app/Types/SteamAPI";
import { useParams }         from "react-router-dom";
import type {
	EmitEvents,
	ListenEvents
}                            from "@app/Types/Socket";

const SocketIO : Socket<EmitEvents, ListenEvents> = io(
	SocketIOLib.GetSpocketHost()
);
const Component = () => {
	const { instanceName } = useParams();
	const ID = useId();
	const { Data } = useArkServer( instanceName! );
	const [ IsSending, setIsSending ] = useState( false );
	const InputRef = useRef<HTMLInputElement>( null );
	const [ SteamMods, setSteamMods ] = useState<Record<number, ISteamApiMod>>( {} );

	const AddMod = async( Input : string ) => {
		setIsSending( true );

		let Id = Number( Input );
		try {
			const AsUrl = new URL( Input );
			if ( AsUrl.searchParams.has( "id" ) ) {
				Id = parseInt( AsUrl.searchParams.get( "id" )! );
			}
		}
		catch ( e ) {
		}

		if ( !isNaN( Id ) ) {
			if ( Data.ark_GameModIds.includes( Id ) ) {
				setIsSending( false );
				return;
			}

			const CopyData = {
				...Data
			};

			CopyData.ark_GameModIds.push( Id );
			CopyData.ark_GameModIds = [ ...new Set( CopyData.ark_GameModIds ) ];
		}
		else {
		}

		setIsSending( false );
	};

	useEffect( () => {
		const QueryMods = () => {
		};

		QueryMods();
		SocketIO.on( "SteamApiUpdated", QueryMods );
		return () => {
			SocketIO.off( "SteamApiUpdated", QueryMods );
		};
	}, [ Data.ark_GameModIds ] );

	return (
		<Card>
			<Card.Header className={ "p-0" }>
				<h3 className="card-title p-3">Server Mods</h3>
			</Card.Header>
			<Card.Body className={ "text-dark p-0" }>
				<InputGroup>
					<FormControl
						className={ "rounded-0" }
						type="text"
						ref={ InputRef }
					></FormControl>
					<IconButton
						className={ "flat" }
						IsLoading={ IsSending }
						variant={ "success" }
						disabled={
							InputRef.current !== null && InputRef.current.value === ""
						}
						onClick={ () => {
							if ( InputRef.current !== null && InputRef.current.value !== "" ) {
								AddMod( InputRef.current.value );
								InputRef.current.value = "";
							}
						} }
					>
						<FontAwesomeIcon icon={ "plus" }/>
					</IconButton>
				</InputGroup>
				<Table striped>
					<tbody>
					{ Data.ark_GameModIds.map( ( ModId, Index ) => (
						<PCServerModsRow
							key={ ID + ModId.toString() }
							InstanceName={ instanceName! }
							ModData={ SteamMods[ ModId ] }
							ModId={ ModId }
							ModIndex={ Index }
						/>
					) ) }
					</tbody>
				</Table>
			</Card.Body>
		</Card>
	);
};

export { Component };
