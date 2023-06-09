import {
	useContext,
	useEffect,
	useMemo,
	useState
}                        from "react";
import {
	DefaultInstanceState,
	GetDefaultPanelServerConfig,
	GetRawInstanceData
}                        from "@shared/Default/Server.Default";
import ServerContext     from "../Context/ServerContext";
import type { Instance } from "@server/MongoDB/DB_Instances";

export function useArkServer( InstanceName : string ) {
	const { InstanceData } = useContext( ServerContext );
	const [ Instance, setInstance ] = useState<Instance>( InstanceData[ InstanceName ] );
	const IsValid = () : boolean => {
		return Instance !== undefined;
	};

	useEffect( () => {
		setInstance( InstanceData[ InstanceName ] );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ InstanceName, InstanceData ] );

	const IsClusterSlave = useMemo( () : boolean => {
		if ( Instance?.Cluster ) {
			return Instance?.Cluster.Master !== Instance._id;
		}
		return false;
	}, [ Instance ] );

	const HasCluster = useMemo( () : boolean => {
		return Instance?.Cluster !== null && Instance?.Cluster !== undefined;
	}, [ Instance ] );

	const ActionIsKillable = useMemo( () : boolean => {
		return ( Instance?.State.ArkmanagerPID || 0 ) > 10;
	}, [ Instance ] );

	const ServerIsKillable = useMemo( () : boolean => {
		return ( Instance?.State.ArkmanagerPID || 0 ) > 10;
	}, [ Instance ] );
 
	return {
		IsValid: IsValid,
		ServerMap: Instance?.ServerMap || {
			LOGO: "",
			BG: ""
		},
		Instance: Instance,
		Data: Instance?.ArkmanagerCfg || GetRawInstanceData(),
		State: Instance?.State || DefaultInstanceState(),
		InstanceName: InstanceName,
		PanelConfig: Instance?.PanelConfig || GetDefaultPanelServerConfig(),
		IsClusterSlave,
		HasCluster,
		ActionIsKillable,
		ServerIsKillable
	};
}
