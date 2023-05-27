import {
    apiAuth,
    apiHandleError,
    fireSwalFromApi,
    onConfirm
} from "@app/Lib/tRPC";
import { IconButton } from "@comp/Elements/Buttons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useArkServer } from "@hooks/useArkServer";
import { useCluster } from "@hooks/useCluster";
import { MakeRandomString } from "@kyri123/k-javascript-utils";
import { useToggle } from "@kyri123/k-reactutils";
import PPClusterEditor from "@page/app/pageComponents/Cluster/ClusterEditor";
import type { Cluster } from "@server/MongoDB/MongoCluster";
import type { FunctionComponent } from "react";
import { useState } from "react";
import {
    Button,
    ButtonGroup,
    Card,
    Col,
    Table
} from "react-bootstrap";


interface IPCServerClusterRow {
	ServerName: string,
	ClusterID: string
}

const PCServerClusterRow: FunctionComponent<IPCServerClusterRow> = ( { ServerName } ) => {
	const { isValid, ServerMap, Data } = useArkServer( ServerName );

	if( !isValid() ) {
		return (
			<></>
		);
	} else {
		return (
			<tr>
				<td className="w-0"><img alt={ Data.serverMap } src={ ServerMap.LOGO } className="w-10" />
				</td>
				<td className="w-100 align-middle">{ Data.ark_SessionName }</td>
			</tr>
		);
	}
};


interface IPCClusterElementProps {
	cluster: Cluster,
	refresh: () => void
}

const ClusterElement: FunctionComponent<IPCClusterElementProps> = ( { cluster, refresh } ) => {
	const [ showEditCluster, toggleEditCluster ] = useToggle( false );
	const { Cluster, MasterServer, isValid } = useCluster( cluster._id! );
	const [ isSending, setIsSending ] = useState( false );
	const { ServerMap, Data } = useArkServer( MasterServer ? MasterServer[ 0 ] : "" );
	const ClusterID = cluster._id!;

	if( !isValid ) {
		return (
			<></>
		);
	}

	const removeCluster = async() => {
		if( await onConfirm( "Möchtest du wirklich diesen Cluster löschen?" ) ) {
			setIsSending( true );
			const result = await apiAuth.server.clusterManagement.removeCluster.mutate( ClusterID ).catch( apiHandleError );
			if( result ) {
				await refresh();
				fireSwalFromApi( result, true );
			}
			setIsSending( false );
		}
	};

	const wipeCluster = async() => {
		if( await onConfirm( "Möchtest du wirklich diesen Cluster löschen?" ) ) {
			setIsSending( true );
			const result = await apiAuth.server.clusterManagement.wipeCluster.mutate( ClusterID ).catch( apiHandleError );
			if( result ) {
				fireSwalFromApi( result, true );
			}
			setIsSending( false );
		}
	};

	return (
		<Col md={ 6 }>
			<Card className="mt-3 rounded-0">
				<Card.Header className="text-bg-dark rounded-0 text-center font-bold text-lg">
					{ Cluster.DisplayName }
				</Card.Header>

				<div className="rounded-0 widget-user-header text-white"
					style={ {
						background: "url('/img/backgrounds/sc.jpg') center center"
					} }>
					<div style={ { zIndex: 1000, height: 150 } }
						className="position-relative">
					</div>
					<div className="text-bg-dark position-relative" style={ { height: 40 } }>
						<img src={ ServerMap.LOGO }
							className="position-absolute bottom-0 start-50 translate-middle-x"
							style={ { height: 100, width: 100, zIndex: 2 } }
							alt={
								Data.serverMap
							} />
						<ButtonGroup className="w-100 h-100">
							<Button className="flat me-5" variant="dark"
							        onClick={ toggleEditCluster }>
								<FontAwesomeIcon icon="edit" />
							</Button>
							<IconButton IsLoading={ isSending } className="flat ms-5" variant="danger"
							            onClick={ removeCluster }>
								<FontAwesomeIcon icon="trash-alt" />
							</IconButton>
						</ButtonGroup>
					</div>
				</div>

				<Card.Body className="rounded-0 p-0">
					<Table className="table table-striped m-0">
						<tbody>
							{ Cluster.Instances.map( Instance => (
								<PCServerClusterRow key={ MakeRandomString( 30, "-" ) } ServerName={ Instance }
							                    ClusterID={ ClusterID } />
							) ) }
						</tbody>
					</Table>
					<IconButton IsLoading={ isSending } className="flat w-full" variant="danger"
					            onClick={ wipeCluster }>
						<FontAwesomeIcon icon="trash-alt" className="me-2" />
						wipe Cluster
					</IconButton>
				</Card.Body>
			</Card>

			<PPClusterEditor refresh={ refresh } onHide={ toggleEditCluster } show={ showEditCluster }
			                 ClusterID={ ClusterID } />
		</Col>
	);
};

export default ClusterElement;
