import type { Instance } from "@server/MongoDB/MongoInstances";
import {
	defaultInstanceState,
	getDefaultPanelServerConfig,
	getRawInstanceData
} from "@shared/Default/Server.Default";
import {
	useContext,
	useEffect,
	useMemo,
	useState
} from "react";
import ServerContext from "../Context/ServerContext";


export function useArkServer( InstanceName: string ) {
	const { instanceData } = useContext( ServerContext );
	const [ instance, setInstance ] = useState<Instance>( instanceData[ InstanceName ] );
	const isValid = (): boolean => instance !== undefined;

	useEffect( () => {
		setInstance( instanceData[ InstanceName ] );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ InstanceName, instanceData ] );

	const isClusterSlave = useMemo( (): boolean => {
		if( instance?.cluster ) {
			return instance?.cluster.Master !== instance._id;
		}
		return false;
	}, [ instance ] );

	const hasCluster = useMemo( (): boolean => instance?.cluster !== null && instance?.cluster !== undefined, [ instance ] );

	const actionIsKillable = useMemo( (): boolean => ( instance?.State.ArkmanagerPID || 0 ) > 10, [ instance ] );

	const serverIsKillable = useMemo( (): boolean => ( instance?.State.ArkmanagerPID || 0 ) > 10, [ instance ] );

	return {
		isValid: isValid,
		serverMap: instance?.ServerMap || {
			LOGO: "",
			BG: ""
		},
		instance: instance,
		data: instance?.ArkmanagerCfg || getRawInstanceData(),
		state: instance?.State || defaultInstanceState(),
		instanceName: InstanceName,
		panelConfig: instance?.PanelConfig || getDefaultPanelServerConfig(),
		isClusterSlave,
		hasCluster,
		actionIsKillable,
		serverIsKillable
	};
}
