import {
	useContext,
	useEffect,
	useMemo,
	useState
}                    from "react";
import ServerContext from "../Context/ServerContext";
import type { Instance }  from "@server/MongoDB/DB_Instances";

export function useCluster( InstanceName : string ) {
	const { ClusterData, InstanceData } = useContext( ServerContext );
	const [ Cluster, setCluster ] = useState( ClusterData[ InstanceName ] );

	useEffect( () => {
		setCluster( () => ClusterData[ InstanceName ] );
	}, [ InstanceName, ClusterData ] );

	const Servers = useMemo( () : Record<string, Instance> => {
		const Return : Record<string, Instance> = {};
		if ( Cluster !== undefined ) {
			for ( const Instance of Cluster.Instances ) {
				if ( InstanceData[ Instance ] ) {
					Return[ Instance ] = InstanceData[ Instance ];
				}
			}
		}
		return Return;
	}, [ Cluster, InstanceData ] );

	const MasterServer = useMemo( () : [ string, Instance ] | undefined => {
		if ( Cluster !== undefined ) {
			if ( Servers[ Cluster.Master ] ) {
				return [ Cluster.Master, Servers[ Cluster.Master ] ];
			}
		}
		return undefined;
	}, [ Cluster, Servers ] );

	const IsValid = useMemo( () : boolean => {
		return Cluster !== undefined && MasterServer !== undefined;
	}, [ Cluster, MasterServer ] );

	return {
		IsValid: IsValid,
		TempModify: setCluster,
		Cluster,
		Servers,
		MasterServer: MasterServer!
	};
}
