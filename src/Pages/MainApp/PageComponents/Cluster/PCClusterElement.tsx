import type {
	FunctionComponent} from "react";
import {
	useContext
}                           from "react";
import {
	Button,
	ButtonGroup,
	Card,
	Col,
	Table
}                           from "react-bootstrap";
import { useCluster }       from "../../../../Hooks/useCluster";
import { useArkServer }     from "../../../../Hooks/useArkServer";
import { MakeRandomString } from "@kyri123/k-javascript-utils";
import { FontAwesomeIcon }  from "@fortawesome/react-fontawesome";
import AlertContext         from "../../../../Context/AlertContext";

interface IPCServerClusterRow {
	ServerName : string;
	ClusterID : string;
}

const PCServerClusterRow : FunctionComponent<IPCServerClusterRow> = ( { ServerName } ) => {
	const { IsValid, ServerMap, Data } = useArkServer( ServerName );

	if ( !IsValid() ) {
		return (
			<></>
		);
	}

	else {
		return (
			<tr>
				<td className={ "w-0" }><img alt={ Data.serverMap } src={ ServerMap.LOGO } className={ "w-10" }/>
				</td>
				<td className={ "w-100 align-middle" }>{ Data.ark_SessionName }</td>
			</tr>
		);
	}
};


interface IPCClusterElementProps {
	ClusterID : string;
	TriggerEdit : ( Id : string ) => void;
	TriggerRemove : ( Id : string ) => void;
}

const PCClusterElement : FunctionComponent<IPCClusterElementProps> = ( { ClusterID, TriggerEdit, TriggerRemove } ) => {
	const { Cluster, MasterServer, IsValid } = useCluster( ClusterID );
	const { ServerMap, Data } = useArkServer( MasterServer[ 0 ] );
	const { setAcceptAction } = useContext( AlertContext );

	if ( !IsValid ) {
		return (
			<></>
		);
	}

	return (
		<Col md={ 6 }>
			<Card className={ "mt-3 rounded-0" }>
				<Card.Header
					className={ "text-bg-dark rounded-0 text-center font-bold text-lg" }>
					{ Cluster.DisplayName }
				</Card.Header>

				<div
					className="rounded-0 widget-user-header text-white"
					style={ {
						background: "url('/img/backgrounds/sc.jpg') center center"
					} }
				>
					<div
						style={ { zIndex: 1000, height: 150 } }
						className={ "position-relative" }
					>
					</div>
					<div
						className={ "text-bg-dark position-relative" } style={ { height: 40 } }>
						<img
							src={ ServerMap.LOGO }
							className="position-absolute bottom-0 start-50 translate-middle-x"
							style={ { height: 100, width: 100, zIndex: 2 } }
							alt={
								Data.serverMap
							}
						/>
						<ButtonGroup className={ "w-100 h-100" }>
							<Button className={ "flat me-5" } variant={ "dark" }
							        onClick={ () => TriggerEdit( ClusterID ) }>
								<FontAwesomeIcon icon={ "edit" }/>
							</Button>
							<Button className={ "flat ms-5" } variant={ "danger" } onClick={ () => setAcceptAction( {
								Payload: TriggerRemove,
								PayloadArgs: [ ClusterID ],
								ActionTitle: "Möchtest du wirklich diesen Cluster entfernen?"
							} ) }>
								<FontAwesomeIcon icon={ "trash-alt" }/>
							</Button>
						</ButtonGroup>
					</div>
				</div>

				<Card.Body className={ "rounded-0 p-0" }>
					<Table className={ "table table-striped m-0" }>
						<tbody>
						{ Cluster.Instances.map( Instance => (
							<PCServerClusterRow key={ MakeRandomString( 30, "-" ) } ServerName={ Instance }
							                    ClusterID={ ClusterID }/>
						) ) }
						</tbody>
					</Table>
				</Card.Body>
			</Card>
		</Col>
	);
};

export default PCClusterElement;
