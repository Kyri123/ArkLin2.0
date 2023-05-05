import type { FC }                     from "react";
import {
	useContext,
	useState
}                                      from "react";
import { FontAwesomeIcon }             from "@fortawesome/react-fontawesome";
import { Modal }                       from "react-bootstrap";
import { IconButton }                  from "@comp/Elements/AdminLTE/Buttons";
import CLTEInput                       from "@comp/Elements/AdminLTE/AdminLTE_Inputs";
import { GetDefaultPanelServerConfig } from "@shared/Default/Server.Default";
import ServerContext                   from "@context/ServerContext";
import _                               from "lodash";
import { ServerAdminCard }             from "@page/app/pageComponents/adminServer/ServerAdminCard";
import UpdateSelectMask                from "@shared/SelectMask/Arkmanager_Command_Update.json";
import type { InputSelectMask }        from "@app/Types/Systeminformation";
import { useToggle }                   from "@kyri123/k-reactutils";

const Component : FC = () => {
	const { InstanceData } = useContext( ServerContext );
	const [ ShowNewServer, toggleShowNewServer ] = useToggle( false );
	const [ FormData, setFormData ] = useState( () => _.cloneDeep( GetDefaultPanelServerConfig() ) );
	const [ IsSending, setIsSending ] = useState( false );

	const CreateServer = async() => {
		setIsSending( true );

		setIsSending( false );
		toggleShowNewServer();
		setFormData( () => _.cloneDeep( GetDefaultPanelServerConfig() ) );
	};

	return (
		<>
			<div className="row" id="serverControlCenterContainer">
				{ Object.entries( InstanceData ).map( ( [ InstanceName, Instance ] ) => (
					<ServerAdminCard
						InstanceName={ InstanceName }
						key={ Instance._id }
					/>
				) ) }

				<span className="col-lg-6 col-xl-4 mt-3">
          <div
	          onClick={ toggleShowNewServer }
	          className="border border-success text-success align-content-center justify-content-center align-items-center d-flex card w-100 rounded-0"
	          style={ { fontSize: 75, height: 450, cursor: "pointer" } }
          >
            <FontAwesomeIcon icon={ "plus" }/>
          </div>
        </span>
			</div>

			<Modal
				size={ "lg" }
				show={ ShowNewServer }
				onHide={ toggleShowNewServer }
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
								const Obj : Record<string, any> = {};
								Obj[ Key ] = Val;
								setFormData( {
									...FormData,
									...Obj
								} );
							} }
							ValueKey={ Key }
							InputSelectMask={ {
								AutoUpdateParameters: UpdateSelectMask as InputSelectMask[]
							} }
						>
							{ Key }
						</CLTEInput>
					) ) }
				</Modal.Body>
				<Modal.Footer>
					<IconButton
						variant={ "success" }
						IsLoading={ IsSending }
						onClick={ CreateServer }
					>
						<FontAwesomeIcon icon={ "save" }/> Erstellen
					</IconButton>
					<IconButton
						variant={ "danger" }
						onClick={ toggleShowNewServer }
					>
						<FontAwesomeIcon icon={ "cancel" }/> Abbrechen
					</IconButton>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export { Component };
