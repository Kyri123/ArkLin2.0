import { Modal }                  from "react-bootstrap";
import { LTELoadingButton }       from "../AdminLTE/AdminLTE_Buttons";
import { FontAwesomeIcon }        from "@fortawesome/react-fontawesome";
import {
	useContext,
	useEffect,
	useState
}                                 from "react";
import CLTEInput, { ISelectMask } from "../AdminLTE/AdminLTE_Inputs";
import {
	EArkmanagerCommands,
	GetMaskFromCommand
}                                 from "../../../Lib/ServerUtils.Lib";
import Select                     from "react-select";
import { API_ServerLib }          from "../../../Lib/Api/API_Server.Lib";
import { useArkServer }           from "../../../Hooks/useArkServer";
import AlertContext               from "../../../Context/AlertContext";

const options = [
	{ value: EArkmanagerCommands.install, label: "Installieren" },
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

export default function CServerAction( Props : {
	InstanceName : string;
	Show : boolean;
	OnClose : () => void;
} ) {
	const { State } = useArkServer( Props.InstanceName );
	const GAlert = useContext( AlertContext );
	const [ IsSending, setIsSending ] = useState( false );
	const [ Parameter, setParameter ] = useState<string[]>( [] );
	const [ ParameterMask, setParameterMask ] = useState<
		Record<string, ISelectMask[]>
	>( { para: [] } );
	const [ Selected, setSelected ] = useState<{
		value : EArkmanagerCommands;
		label : string;
	} | null>( null );

	useEffect( () => {
		setParameter( [] );
		setSelected( null );
		setIsSending( false );
	}, [ Props.Show ] );

	useEffect( () => {
		if ( Selected ) {
			setParameterMask( { para: GetMaskFromCommand( Selected.value ) } );
		}
	}, [ State.State, Selected ] );

	const SendCommand = async() => {
		if ( Selected ) {
			setIsSending( true );
			const Response = await API_ServerLib.SendCommandToServer(
				Props.InstanceName,
				Selected.value,
				Parameter.filter( ( C ) => C.trim().replaceAll( " ", "" ) !== "" )
			);
			GAlert.DoSetAlert( Response );
			Props.OnClose();
		}
	};

	return (
		<Modal
			onHide={ Props.OnClose }
			show={ Props.Show && State.ArkmanagerPID === 0 }
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
							SelectMask={ ParameterMask }
							ValueKey={ "para" }
						>
							{ " " }
							Parameter{ " " }
						</CLTEInput>
					</>
				) }
			</Modal.Body>
			<Modal.Footer>
				<LTELoadingButton
					onClick={ SendCommand }
					Disabled={ Selected === null }
					IsLoading={ IsSending }
				>
					<FontAwesomeIcon icon={ "terminal" }/> Ausführen
				</LTELoadingButton>
				<LTELoadingButton variant={ "danger" } onClick={ Props.OnClose }>
					<FontAwesomeIcon icon={ "cancel" }/> Abbrechen
				</LTELoadingButton>
			</Modal.Footer>
		</Modal>
	);
}
