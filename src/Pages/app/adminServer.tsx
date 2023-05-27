import {
    apiAuth,
    apiHandleError,
    fireSwalFromApi
} from "@app/Lib/tRPC";
import type { InputSelectMask } from "@app/Types/Systeminformation";
import { IconButton } from "@comp/Elements/Buttons";
import TableInput from "@comp/Elements/TableInput";
import ServerContext from "@context/ServerContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useToggle } from "@kyri123/k-reactutils";
import { ServerAdminCard } from "@page/app/pageComponents/adminServer/ServerAdminCard";
import { getDefaultPanelServerConfig } from "@shared/Default/Server.Default";
import UpdateSelectMask from "@shared/SelectMask/Arkmanager_Command_Update.json";
import _ from "lodash";
import type { FC } from "react";
import {
    useContext,
    useState
} from "react";
import {
    Modal,
    Table
} from "react-bootstrap";


const Component: FC = () => {
	const { InstanceData } = useContext( ServerContext );
	const [ ShowNewServer, toggleShowNewServer ] = useToggle( false );
	const [ FormData, setFormData ] = useState( () => _.cloneDeep( getDefaultPanelServerConfig() ) );
	const [ IsSending, setIsSending ] = useState( false );

	const createServer = async() => {
		setIsSending( true );
		const result = await apiAuth.server.action.createServer.mutate( {
			config: _.cloneDeep( FormData )
		} ).catch( apiHandleError );
		if( result ) {
			fireSwalFromApi( result, true );
		}
		setIsSending( false );
		toggleShowNewServer();
		setFormData( () => _.cloneDeep( getDefaultPanelServerConfig() ) );
	};

	return (
		<>
			<div className="row" id="serverControlCenterContainer">
				{ Object.entries( InstanceData ).map( ( [ InstanceName, Instance ] ) => (
					<ServerAdminCard InstanceName={ InstanceName }
						key={ Instance._id } />
				) ) }

				<span className="col-lg-6 col-xl-4 mt-3">
					<div onClick={ toggleShowNewServer }
	          className="border border-success text-success align-content-center justify-content-center align-items-center d-flex card w-100 rounded-0"
	          style={ { fontSize: 75, height: 450, cursor: "pointer" } }>
						<FontAwesomeIcon icon="plus" />
					</div>
				</span>
			</div>

			<Modal size="xl"
				show={ ShowNewServer }
				onHide={ toggleShowNewServer }>
				<Modal.Header closeButton>Server Erstellen</Modal.Header>
				<Modal.Body className="p-0">
					<Table className="p-0 m-0" striped>
						<tbody>
							{ Object.entries( FormData ).map( ( [ Key, Value ], Idx ) => (
								<TableInput Type={
									Array.isArray( Value )
										? "text"
										: typeof Value !== "string"
											? "number"
											: "text"
								}
								key={ "NEWSERVER" + Key + Idx }
								Value={ Value }
								onValueSet={ Val => {
									const Obj: Record<string, any> = {};
									Obj[ Key ] = Val;
									setFormData( {
										...FormData,
										...Obj
									} );
								} }
								ValueKey={ Key }
								InputSelectMask={ {
									AutoUpdateParameters: UpdateSelectMask as InputSelectMask[]
								} }>
									{ Key }
								</TableInput>
							) ) }
						</tbody>
					</Table>
				</Modal.Body>
				<Modal.Footer>
					<IconButton variant="success"
						IsLoading={ IsSending }
						onClick={ createServer }>
						<FontAwesomeIcon icon="save" /> Erstellen
					</IconButton>
					<IconButton variant="danger"
						onClick={ toggleShowNewServer }>
						<FontAwesomeIcon icon="cancel" /> Abbrechen
					</IconButton>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export { Component };

