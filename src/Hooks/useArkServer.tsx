import {
	useContext,
	useEffect,
	useMemo,
	useState
}                    from "react";
import {
	DefaultInstanceState,
	GetDefaultPanelServerConfig,
	GetRawInstanceData
}                    from "../Shared/Default/Server.Default";
import ServerContext from "../Context/ServerContext";

export function useArkServer( InstanceName : string ) {
	const { InstanceData } = useContext( ServerContext );
	const [ Instance, setInstance ] = useState( InstanceData[ InstanceName ] );

	const IsValid = () : boolean => {
		return Instance !== undefined;
	};

	useEffect( () => {
		setInstance( () => InstanceData[ InstanceName ] );
	}, [ InstanceName, InstanceData ] );

	const IsClusterSlave = useMemo( () : boolean => {
		if ( Instance.Cluster ) {
			return Instance.Cluster.Master !== Instance._id;
		}
		return false;
	}, [ Instance ] );

	const HasCluster = useMemo( () : boolean => {
		return Instance.Cluster !== null && Instance.Cluster !== undefined;
	}, [ Instance ] );

	const ActionIsKillable = useMemo( () : boolean => {
		return Instance.State.ArkmanagerPID > 10;
	}, [ Instance ] );

	const ServerIsKillable = useMemo( () : boolean => {
		return Instance.State.ArkmanagerPID > 10;
	}, [ Instance ] );

	return {
		IsValid: IsValid,
		ServerMap: Instance?.ServerMap || {
			LOGO: "",
			BG: ""
		},
		TempModify: setInstance,
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
