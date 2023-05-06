import {
	useId,
	useMemo,
	useRef,
	useState
}                                     from "react";
import { useArkServer }               from "@hooks/useArkServer";
import {
	Card,
	FormControl,
	InputGroup,
	Table
}                                     from "react-bootstrap";
import { IconButton }                 from "@comp/Elements/Buttons";
import { FontAwesomeIcon }            from "@fortawesome/react-fontawesome";
import PCServerModsRow                from "../../pageComponents/server/PCServerModsRow";
import {
	useLoaderData,
	useParams
}                                     from "react-router-dom";
import type { ServerModsLoaderProps } from "@page/app/loader/server/mods";
import type { SteamMod }              from "@server/MongoDB/DB_SteamAPI_Mods";
import _                              from "lodash";
import {
	fireSwalFromApi,
	successSwal,
	tRPC_Auth,
	tRPC_handleError
}                                     from "@app/Lib/tRPC";

const Component = () => {
	const { steamApiMods } = useLoaderData() as ServerModsLoaderProps;
	const { instanceName } = useParams();
	const ID = useId();
	const { Data } = useArkServer( instanceName! );
	const [ IsSending, setIsSending ] = useState( false );
	const InputRef = useRef<HTMLInputElement>( null );

	const SteamMods = useMemo( () => {
		const result : Record<number, SteamMod | undefined> = {};
		for ( const modId of Data.ark_GameModIds ) {
			result[ Number( modId ) ] = steamApiMods.find( e => Number( e.publishedfileid ) === Number( modId ) );
		}
		return result;
	}, [ Data.ark_GameModIds, steamApiMods ] );

	const AddMod = async( Input : string ) => {
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
			if ( !Data.ark_GameModIds.includes( Id ) ) {
				const mods = _.clone( Data.ark_GameModIds );
				mods.push( Id );
				await updateMods( mods );
				return;
			}

		}
		fireSwalFromApi( "Mod Id oder Url ist nicht richtig" );
	};

	const updateMods = async( mods : number[], asToast = false ) => {
		setIsSending( true );
		await tRPC_Auth.server.config.updateMods.mutate( {
			instanceName: instanceName!,
			mods
		} ).then( e => successSwal( e, asToast ) ).catch( tRPC_handleError );
		setIsSending( false );
	};

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
				<Table striped className="m-0">
					<tbody>
					{ Data.ark_GameModIds.map( ( ModId, Index ) => (
						<PCServerModsRow
							setMods={ updateMods }
							allMods={ _.clone( Data.ark_GameModIds ) }
							isSending={ IsSending }
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
