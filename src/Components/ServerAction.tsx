import { Modal }                from "react-bootstrap";
import { IconButton }           from "@comp/Elements/AdminLTE/Buttons";
import { FontAwesomeIcon }      from "@fortawesome/react-fontawesome";
import type { FC }              from "react";
import {
	useEffect,
	useState
}                               from "react";
import CLTEInput                from "./Elements/AdminLTE/AdminLTE_Inputs";
import {
	EArkmanagerCommands,
	GetMaskFromCommand
}                               from "../Lib/serverUtils";
import Select                   from "react-select";
import { useArkServer }         from "@hooks/useArkServer";
import type { InputSelectMask } from "@app/Types/Systeminformation";
import type { SingleOption }         from "@app/Types/Systeminformation";
import {
	fireSwalFromApi,
	tRPC_Auth,
	tRPC_handleError
}                               from "@app/Lib/tRPC";

const options = [
	{ value: EArkmanagerCommands.install, label: "Installieren" },
	{ value: EArkmanagerCommands.start, label: "Server Starten" },
	{ value: EArkmanagerCommands.update, label: "Updaten" },
	{ value: EArkmanagerCommands.restart, label: "Neustarten" },
	{ value: EArkmanagerCommands.backup, label: "Backup Erstellen" },
	{
		value: EArkmanagerCommands.cancelshutdown,
		label: "Runterfahren abbrechen"
	},
	{ value: EArkmanagerCommands.checkmodupdate, label: "Prüfen auf Mod Update" },
	{ value: EArkmanagerCommands.listMods, label: "Mods Auflisten" },
	{ value: EArkmanagerCommands.saveworld, label: "Welt Speichern" },
	{ value: EArkmanagerCommands.status, label: "Status" },
	{ value: EArkmanagerCommands.stop, label: "Stoppen" },
	{ value: EArkmanagerCommands.installmods, label: "Mods Installieren" },
	{ value: EArkmanagerCommands.uninstallmods, label: "Mods Deinstallieren" }
];

interface ServerActionProps {
	InstanceName : string;
	Show : boolean;
	OnClose : () => void;
}

const ServerAction : FC<ServerActionProps> = ( { InstanceName, OnClose, Show } ) => {
	const { State } = useArkServer( InstanceName );
	const [ IsSending, setIsSending ] = useState( false );
	const [ Parameter, setParameter ] = useState<string[]>( [] );
	const [ ParameterMask, setParameterMask ] = useState<
		Record<string, InputSelectMask[]>
	>( { para: [] } );
	const [ Selected, setSelected ] = useState<SingleOption<EArkmanagerCommands>>( null );

	const onShow = () => {
		setParameter( [] );
		setSelected( null );
		setIsSending( false );
	};

	useEffect( () => {
		if ( Selected ) {
			setParameterMask( { para: GetMaskFromCommand( Selected.value ) } );
		}
	}, [ State.State, Selected ] );

	const SendCommand = async() => {
		if ( Selected ) {
			setIsSending( true );
			const result = await tRPC_Auth.server.action.executeCommand.mutate( {
				instanceName: InstanceName,
				command: Selected.value,
				params: Parameter
			} ).catch( tRPC_handleError );
			if ( result ) {
				fireSwalFromApi( result, true );
			}
			OnClose();
		}
	};

	return (
		<Modal onShow={ onShow }
		       onHide={ OnClose }
		       show={ Show && State.ArkmanagerPID === 0 }
		       centered
		       size={ "lg" }
		>
			<Modal.Header closeButton>Server Aktion</Modal.Header>
			<Modal.Body>
				<Select
					defaultValue={ Selected }
					onChange={ setSelected }
					options={ options }
					isClearable={ true }
				/>
				{ ParameterMask.para.length > 0 && Selected !== null && (
					<>
						<hr/>
						<CLTEInput
							Value={ Parameter }
							OnValueSet={ setParameter }
							InputSelectMask={ ParameterMask }
							ValueKey={ "para" }
						>
							{ " " }
							Parameter{ " " }
						</CLTEInput>
					</>
				) }
			</Modal.Body>
			<Modal.Footer>
				<IconButton
					onClick={ SendCommand }
					disabled={ Selected === null }
					IsLoading={ IsSending }
				>
					<FontAwesomeIcon icon={ "terminal" }/> Ausführen
				</IconButton>
				<IconButton variant={ "danger" } onClick={ OnClose }>
					<FontAwesomeIcon icon={ "cancel" }/> Abbrechen
				</IconButton>
			</Modal.Footer>
		</Modal>
	);
};

export default ServerAction;
