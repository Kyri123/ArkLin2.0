import type { FunctionComponent }  from "react";
import {
	useContext,
	useState
}                                  from "react";
import PPClusterEditor             from "../MainApp/PageComponents/Cluster/PCClusterEditor";
import PCClusterElement            from "../MainApp/PageComponents/Cluster/PCClusterElement";
import { IconButton }              from "@comp/Elements/AdminLTE/Buttons";
import { FontAwesomeIcon }         from "@fortawesome/react-fontawesome";
import { Row }                     from "react-bootstrap";
import { useToggle }               from "@kyri123/k-reactutils";
import {
	tRPC_Auth,
	tRPC_handleError
}                                  from "@app/Lib/tRPC";
import { useLoaderData }           from "react-router-dom";
import type { ClusterLoaderProps } from "@page/app/loader/cluster";
import ServerContext               from "@context/ServerContext";

const Component : FunctionComponent = () => {
	const { GetAllServer } = useContext( ServerContext );
	const { clusters } = useLoaderData() as ClusterLoaderProps;
	const [ allClusters, setAllClusters ] = useState( () => clusters );
	const [ showCreateCluster, toggleCreateCluster ] = useToggle( false );

	const refresh = async() => {
		await GetAllServer();
		await tRPC_Auth.server.clusterManagement.getAllCluster.query().then( setAllClusters ).catch( tRPC_handleError );
	};

	return (
		<>
			<IconButton className={ "w-100" } onClick={ toggleCreateCluster }>
				<FontAwesomeIcon icon={ "plus" }/> Cluster Erstellen
			</IconButton>
			<Row>
				{ allClusters.map( cluster =>
					<PCClusterElement key={ cluster._id } cluster={ cluster } refresh={ refresh }/>
				) }
			</Row>
			<PPClusterEditor refresh={ refresh } show={ showCreateCluster } onHide={ toggleCreateCluster }/>
		</>
	);
};

export { Component };
