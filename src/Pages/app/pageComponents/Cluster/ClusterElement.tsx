import type { Cluster } from "@/server/src/MongoDB/MongoCluster";
import PPClusterEditor from "@/src/Pages/app/pageComponents/Cluster/ClusterEditor";
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
import type { FunctionComponent } from "react";
import { useMemo, useState } from "react";
import {
	Button,
	ButtonGroup,
	Card,
	Col,
	Table
} from "react-bootstrap";


interface IPCServerClusterRow {
	ServerName: string,
	clusterID: string
}

export const PCServerClusterRow: FunctionComponent<IPCServerClusterRow> = ( { ServerName } ) => {
	const { isValid, serverMap, data } = useArkServer( ServerName );

	if( !isValid() ) {
		return (
			<></>
		);
	} else {
		return (
			<tr>
				<td className="w-0"><img alt={ data.serverMap } src={ serverMap.LOGO } className="w-10" />
				</td>
				<td className="w-100 align-middle">{ data.ark_SessionName }</td>
			</tr>
		);
	}
};


interface IPCClusterElementProps {
	clusterData: Cluster,
	refresh: () => void
}

const ClusterElement: FunctionComponent<IPCClusterElementProps> = ( { clusterData, refresh } ) => {
	const [ showEditCluster, toggleEditCluster ] = useToggle( false );
	const { cluster, masterServer, isValid } = useCluster( clusterData._id! );
	const [ isSending, setIsSending ] = useState( false );
	const { serverMap, data } = useArkServer( masterServer ? masterServer[ 0 ] : "" );
	const clusterID = useMemo( () => cluster._id!, [ cluster._id ] );

	if( !isValid ) {
		return (
			<></>
		);
	}

	const removeCluster = async() => {
		if( await onConfirm( "Möchtest du wirklich diesen cluster löschen?" ) ) {
			setIsSending( true );
			const result = await apiAuth.server.clusterManagement.removeCluster.mutate( clusterID ).catch( apiHandleError );
			if( result ) {
				await refresh();
				fireSwalFromApi( result, true );
			}
			setIsSending( false );
		}
	};

	const wipeCluster = async() => {
		if( await onConfirm( "Möchtest du wirklich diesen cluster löschen?" ) ) {
			setIsSending( true );
			const result = await apiAuth.server.clusterManagement.wipeCluster.mutate( clusterID ).catch( apiHandleError );
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
					{ cluster.DisplayName }
				</Card.Header>

				<div className="rounded-0 widget-user-header text-white"
					style={ {
						background: "url('/img/backgrounds/sc.jpg') center center"
					} }>
					<div style={ { zIndex: 1000, height: 150 } }
						className="position-relative">
					</div>
					<div className="text-bg-dark position-relative" style={ { height: 40 } }>
						<img src={ serverMap.LOGO }
							className="position-absolute bottom-0 start-50 translate-middle-x"
							style={ { height: 100, width: 100, zIndex: 2 } }
							alt={
								data.serverMap
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
							{ cluster.Instances.map( Instance => (
								<PCServerClusterRow key={ MakeRandomString( 30, "-" ) } ServerName={ Instance }
							                    clusterID={ clusterID } />
							) ) }
						</tbody>
					</Table>
					<IconButton IsLoading={ isSending } className="flat w-full" variant="danger"
					            onClick={ wipeCluster }>
						<FontAwesomeIcon icon="trash-alt" className="me-2" />
						wipe cluster
					</IconButton>
				</Card.Body>
			</Card>

			<PPClusterEditor refresh={ refresh } onHide={ toggleEditCluster } show={ showEditCluster }
			                 clusterID={ clusterID } />
		</Col>
	);
};

export default ClusterElement;
