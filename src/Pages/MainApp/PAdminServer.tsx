import {
	useContext,
	useEffect,
	useState
}                                      from "react";
import CServerAdminCard                from "../../Components/Elements/Server/ServerAdminCard";
import { FontAwesomeIcon }             from "@fortawesome/react-fontawesome";
import { Modal }                       from "react-bootstrap";
import { LTELoadingButton }            from "../../Components/Elements/AdminLTE/AdminLTE_Buttons";
import CLTEInput                       from "../../Components/Elements/AdminLTE/AdminLTE_Inputs";
import { GetDefaultPanelServerConfig } from "../../Shared/Default/Server.Default";
import { API_ServerLib }               from "../../Lib/Api/API_Server.Lib";
import Update_SelectMask               from "../../Shared/SelectMask/Arkmanager_Command_Update.json";
import ServerContext                   from "../../Context/ServerContext";
import AlertContext                    from "../../Context/AlertContext";
import { ISelectMask }                 from "../../Shared/Type/Systeminformation";

export default function PAdminServer() {
	const { InstanceData } = useContext( ServerContext );
	const GAlert = useContext( AlertContext );
	const [ ShowNewServer, setShowNewServer ] = useState( false );
	const [ FormData, setFormData ] = useState( GetDefaultPanelServerConfig() );
	const [ IsSending, setIsSending ] = useState( false );

	useEffect( () => setFormData( GetDefaultPanelServerConfig() ), [ ShowNewServer ] );

	const CreateServer = async() => {
		setIsSending( true );
		GAlert.DoSetAlert( await API_ServerLib.AddServer( FormData ) );
		setIsSending( false );
		setShowNewServer( false );
	};

	return (
		<>
			<div className="row" id="serverControlCenterContainer">
				{ Object.entries( InstanceData ).map( ( [ InstanceName ] ) => (
					<CServerAdminCard
						InstanceName={ InstanceName }
						key={ "SERVERADMIN" + InstanceName }
					/>
				) ) }

				<span className="col-lg-6 col-xl-4">
          <div
	          onClick={ () => setShowNewServer( true ) }
	          className="border border-success text-success align-content-center justify-content-center align-items-center d-flex card w-100"
	          style={ { fontSize: 75, height: 450, cursor: "pointer" } }
          >
            <FontAwesomeIcon icon={ "plus" }/>
          </div>
        </span>
			</div>

			<Modal
				size={ "lg" }
				show={ ShowNewServer }
				onHide={ () => setShowNewServer( false ) }
			>
				<Modal.Header closeButton>Server Erstellen</Modal.Header>
				<Modal.Body>
					{ Object.entries( FormData ).map( ( [ Key, Value ], Idx ) => (
						<CLTEInput
							Type={
								Array.isArray( Value )
									? "text"
									: typeof Value !== "string"
										? "number"
										: "text"
							}
							key={ "NEWSERVER" + Key + Idx }
							Value={ Value }
							OnValueSet={ ( Val ) => {
								console.log( Val );
								const Obj : Record<string, any> = {};
								Obj[ Key ] = Val;
								setFormData( {
									...FormData,
									...Obj
								} );
							} }
							ValueKey={ Key }
							SelectMask={ {
								AutoUpdateParameters: Update_SelectMask as ISelectMask[]
							} }
						>
							{ Key }
						</CLTEInput>
					) ) }
				</Modal.Body>
				<Modal.Footer>
					<LTELoadingButton
						BtnColor={ "success" }
						IsLoading={ IsSending }
						onClick={ CreateServer }
					>
						<FontAwesomeIcon icon={ "save" }/> Erstellen
					</LTELoadingButton>
					<LTELoadingButton
						BtnColor={ "danger" }
						onClick={ () => setShowNewServer( false ) }
					>
						<FontAwesomeIcon icon={ "cancel" }/> Abbrechen
					</LTELoadingButton>
				</Modal.Footer>
			</Modal>
		</>
	);
}
