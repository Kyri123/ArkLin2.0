import {
	apiAuth,
	apiHandleError,
	fireSwalFromApi,
	successSwal
} from "@app/Lib/tRPC";
import { IconButton } from "@comp/Elements/Buttons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useArkServer } from "@hooks/useArkServer";
import type { ServerModsLoaderProps } from "@page/app/loader/server/mods";
import type { SteamMod } from "@server/MongoDB/MongoSteamAPIMods";
import _ from "lodash";
import {
	useId,
	useMemo,
	useRef,
	useState
} from "react";
import {
	Card,
	FormControl,
	InputGroup,
	Table
} from "react-bootstrap";
import {
	useLoaderData,
	useParams
} from "react-router-dom";
import PCServerModsRow from "../../pageComponents/server/PCServerModsRow";


const Component = () => {
	const { steamApiMods } = useLoaderData() as ServerModsLoaderProps;
	const { instanceName } = useParams();
	const ID = useId();
	const { data } = useArkServer( instanceName! );
	const [ isSending, setIsSending ] = useState( false );
	const inputRef = useRef<HTMLInputElement>( null );

	const steamMods = useMemo( () => {
		const result: Record<number, SteamMod | undefined> = {};
		for( const modId of data.ark_GameModIds ) {
			result[ Number( modId ) ] = steamApiMods.find( e => Number( e.publishedfileid ) === Number( modId ) );
		}
		return result;
	}, [ data.ark_GameModIds, steamApiMods ] );

	const addMod = async( Input: string ) => {
		let id = Number( Input );
		try {
			const asUrl = new URL( Input );
			if( asUrl.searchParams.has( "id" ) ) {
				id = parseInt( asUrl.searchParams.get( "id" )! );
			}
		} catch( e ) {
		}

		if( !isNaN( id ) ) {
			if( !data.ark_GameModIds.includes( id ) ) {
				const mods = _.clone( data.ark_GameModIds );
				mods.push( id );
				await updateMods( mods );
				return;
			}

		}
		fireSwalFromApi( "Mod id oder Url ist nicht richtig" );
	};

	const updateMods = async( mods: number[], asToast = false ) => {
		setIsSending( true );
		await apiAuth.server.config.updateMods.mutate( {
			instanceName: instanceName!,
			mods
		} ).then( e => successSwal( e, asToast ) ).catch( apiHandleError );
		setIsSending( false );
	};

	return (
		<Card>
			<Card.Header className="p-0">
				<h3 className="card-title p-3">Server Mods</h3>
			</Card.Header>
			<Card.Body className="text-dark p-0">
				<InputGroup>
					<FormControl className="rounded-0"
						type="text"
						ref={ inputRef }></FormControl>
					<IconButton className="flat"
						IsLoading={ isSending }
						variant="success"
						disabled={
							inputRef.current !== null && inputRef.current.value === ""
						}
						onClick={ () => {
							if( inputRef.current !== null && inputRef.current.value !== "" ) {
								addMod( inputRef.current.value );
								inputRef.current.value = "";
							}
						} }>
						<FontAwesomeIcon icon="plus" />
					</IconButton>
				</InputGroup>
				<Table striped className="m-0">
					<tbody>
						{ data.ark_GameModIds.map( ( ModId, Index ) => (
							<PCServerModsRow setMods={ updateMods }
								allMods={ _.clone( data.ark_GameModIds ) }
								isSending={ isSending }
								key={ ID + ModId.toString() }
								InstanceName={ instanceName! }
								ModData={ steamMods[ ModId ] }
								ModId={ ModId }
								ModIndex={ Index } />
						) ) }
					</tbody>
				</Table>
			</Card.Body>
		</Card>
	);
};

export { Component };

