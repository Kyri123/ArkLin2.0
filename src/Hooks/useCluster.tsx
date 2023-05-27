import type { Instance } from "@server/MongoDB/MongoInstances";
import {
	useContext,
	useEffect,
	useMemo,
	useState
} from "react";
import ServerContext from "../Context/ServerContext";


export function useCluster( InstanceName: string ) {
	const { clusterData, instanceData } = useContext( ServerContext );
	const [ cluster, setCluster ] = useState( clusterData[ InstanceName ] );

	useEffect( () => {
		setCluster( () => clusterData[ InstanceName ] );
	}, [ InstanceName, clusterData ] );

	const servers = useMemo( (): Record<string, Instance> => {
		const result: Record<string, Instance> = {};
		if( cluster !== undefined ) {
			for( const instance of cluster.Instances ) {
				if( instanceData[ instance ] ) {
					result[ instance ] = instanceData[ instance ];
				}
			}
		}
		return result;
	}, [ cluster, instanceData ] );

	const masterServer = useMemo( (): [ string, Instance ] | undefined => {
		if( cluster !== undefined ) {
			if( servers[ cluster.Master ] ) {
				return [ cluster.Master, servers[ cluster.Master ] ];
			}
		}
		return undefined;
	}, [ cluster, servers ] );

	const isValid = useMemo( (): boolean => cluster !== undefined && masterServer !== undefined, [ cluster, masterServer ] );

	return {
		isValid: isValid,
		tempModify: setCluster,
		cluster,
		servers,
		masterServer: masterServer!
	};
}
