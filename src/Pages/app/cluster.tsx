import {
	apiAuth,
	apiHandleError
} from "@app/Lib/tRPC";
import { IconButton } from "@comp/Elements/Buttons";
import ServerContext from "@context/ServerContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useToggle } from "@kyri123/k-reactutils";
import type { ClusterLoaderProps } from "@page/app/loader/cluster";
import type { FunctionComponent } from "react";
import {
	useContext,
	useState
} from "react";
import { Row } from "react-bootstrap";
import { useLoaderData } from "react-router-dom";
import PPClusterEditor from "./pageComponents/Cluster/ClusterEditor";
import ClusterElement from "./pageComponents/Cluster/ClusterElement";


const Component: FunctionComponent = () => {
	const { getAllServer } = useContext( ServerContext );
	const { clusters } = useLoaderData() as ClusterLoaderProps;
	const [ allClusters, setAllClusters ] = useState( () => clusters );
	const [ showCreateCluster, toggleCreateCluster ] = useToggle( false );

	const refresh = async() => {
		await getAllServer();
		await apiAuth.server.clusterManagement.getAllCluster.query().then( setAllClusters ).catch( apiHandleError );
	};

	return (
		<>
			<IconButton className="w-100" onClick={ toggleCreateCluster }>
				<FontAwesomeIcon icon="plus" /> Cluster Erstellen
			</IconButton>
			<Row>
				{ allClusters.map( cluster =>
					<ClusterElement key={ cluster._id } clusterData={ cluster } refresh={ refresh } />
				) }
			</Row>
			<PPClusterEditor refresh={ refresh } show={ showCreateCluster } onHide={ toggleCreateCluster } />
		</>
	);
};

export { Component };

