import type { FunctionComponent } from "react";
import {
	useContext,
	useState
}                                 from "react";
import ServerContext              from "../../Context/ServerContext";
import PPClusterEditor            from "./PageComponents/Cluster/PCClusterEditor";
import PCClusterElement           from "./PageComponents/Cluster/PCClusterElement";
import { IconButton }             from "@comp/Elements/AdminLTE/Buttons";
import { FontAwesomeIcon }        from "@fortawesome/react-fontawesome";
import { Row }                    from "react-bootstrap";
import AlertContext               from "../../Context/AlertContext";
import { API_ClusterLib }         from "@app/Lib/Api/API_Cluster.Lib";

const PCluster : FunctionComponent = () => {
	const { DoSetAlert } = useContext( AlertContext );
	const { ClusterData } = useContext( ServerContext );
	const [ SelectedCluster, setSelectedCluster ] = useState<string | undefined>( undefined );

	const TriggerRemoveCluster = async( Id : string ) => {
		DoSetAlert( await API_ClusterLib.RemoveCluster( Id ) );
	};

	return (
		<>
			<IconButton className={ "w-100" } onClick={ () => setSelectedCluster( "" ) }>
				<FontAwesomeIcon icon={ "plus" }/> Cluster Erstellen
			</IconButton>
			<Row>
				{ Object.keys( ClusterData ).map( ID =>
					<PCClusterElement key={ ID } ClusterID={ ID } TriggerEdit={ setSelectedCluster }
					                  TriggerRemove={ TriggerRemoveCluster }/>
				) }
			</Row>
			<PPClusterEditor ClusterID={ SelectedCluster } Close={ () => setSelectedCluster( undefined ) }/>
		</>
	);
};

export default PCluster;
