import { EServerState } from "@/src/Shared/Enum/EServerState";
import {
	apiAuth,
	apiHandleError,
	fireSwalFromApi
} from "@app/Lib/tRPC";
import type {
	InputSelectMask,
	SingleOption
} from "@app/Types/Systeminformation";
import { IconButton } from "@comp/Elements/Buttons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useArkServer } from "@hooks/useArkServer";
import type { FC } from "react";
import {
	useEffect,
	useState
} from "react";
import { Modal } from "react-bootstrap";
import Select from "react-select";
import {
	EArkmanagerCommands,
	GetMaskFromCommand
} from "../Lib/serverUtils";
import SmartInput from "./Elements/SmartInput";


const options = [
	{ value: EArkmanagerCommands.install, disabled: false, label: "Installieren" },
	{ value: EArkmanagerCommands.start, disabled: false, label: "Server Starten" },
	{ value: EArkmanagerCommands.boradcast, disabled: true, label: "Broadcast" },
	{ value: EArkmanagerCommands.update, disabled: undefined, label: "Updaten" },
	{ value: EArkmanagerCommands.restart, disabled: true, label: "Neustarten" },
	{ value: EArkmanagerCommands.backup, disabled: undefined, label: "Backup Erstellen" },
	{
		value: EArkmanagerCommands.cancelshutdown,
		disabled: true,
		label: "Runterfahren abbrechen"
	},
	{ value: EArkmanagerCommands.checkmodupdate, disabled: undefined, label: "Prüfen auf Mod Update" },
	{ value: EArkmanagerCommands.listMods, disabled: undefined, label: "Mods Auflisten" },
	{ value: EArkmanagerCommands.saveworld, disabled: true, label: "Welt Speichern" },
	{ value: EArkmanagerCommands.status, disabled: undefined, label: "Status" },
	{ value: EArkmanagerCommands.stop, disabled: undefined, label: "Stoppen" },
	{ value: EArkmanagerCommands.installmods, disabled: undefined, label: "Mods Installieren" },
	{ value: EArkmanagerCommands.uninstallmods, disabled: undefined, label: "Mods Deinstallieren" }
];

interface ServerActionProps {
	instanceName: string,
	Show: boolean,
	onClose: () => void
}

const ServerAction: FC<ServerActionProps> = ( { instanceName, onClose, Show } ) => {
	const { state } = useArkServer( instanceName );
	const [ isSending, setIsSending ] = useState( false );
	const [ parameter, setParameter ] = useState<string[]>( [] );
	const [ parameterMask, setParameterMask ] = useState<
	Record<string, InputSelectMask[]>
	>( { para: [] } );
	const [ selected, setSelected ] = useState<SingleOption<EArkmanagerCommands>>( null );

	const onShow = () => {
		setParameter( [] );
		setSelected( null );
		setIsSending( false );
	};

	useEffect( () => {
		if( selected ) {
			setParameterMask( { para: GetMaskFromCommand( selected.value ) } );
		}
	}, [ selected ] );

	const sendCommand = async() => {
		if( selected ) {
			setIsSending( true );
			const result = await apiAuth.server.action.executeCommand.mutate( {
				instanceName: instanceName,
				command: selected.value,
				params: parameter
			} ).catch( apiHandleError );
			if( result ) {
				fireSwalFromApi( result, true );
			}
			onClose();
		}
	};

	return (
		<Modal onShow={ onShow }
		       onHide={ onClose }
		       show={ Show && state.ArkmanagerPID === 0 }
		       centered
		       size="lg">
			<Modal.Header closeButton>Server Aktion</Modal.Header>
			<Modal.Body>
				<Select defaultValue={ selected }
					onChange={ setSelected }
					options={ options }
					isOptionDisabled={ option => {
						return !( option.disabled === undefined || option.disabled === ( state.State === EServerState.online ) );
					} }
					isClearable={ true } />
				{ parameterMask.para.length > 0 && selected !== null && (
					<>
						<hr />
						<SmartInput Value={ parameter }
							onValueSet={ setParameter }
							InputSelectMask={ parameterMask }
							ValueKey="para">
							{ " " }
							parameter{ " " }
						</SmartInput>
					</>
				) }
			</Modal.Body>
			<Modal.Footer>
				<IconButton onClick={ sendCommand }
					disabled={ selected === null }
					IsLoading={ isSending }>
					<FontAwesomeIcon icon="terminal" /> Ausführen
				</IconButton>
				<IconButton variant="danger" onClick={ onClose }>
					<FontAwesomeIcon icon="cancel" /> Abbrechen
				</IconButton>
			</Modal.Footer>
		</Modal>
	);
};

export default ServerAction;
