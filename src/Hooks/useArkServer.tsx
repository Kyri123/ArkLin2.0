import {
	useContext,
	useEffect,
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
	const [ Instance, setInstance ] = useState( InstanceData[ InstanceName ] )

	const IsValid = () : boolean => {
		return Instance !== undefined;
	}

	useEffect( () => {
		setInstance( () => InstanceData[ InstanceName ] );
	}, [ InstanceName, InstanceData ] );

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
		PanelConfig: Instance?.PanelConfig || GetDefaultPanelServerConfig()
	}
}