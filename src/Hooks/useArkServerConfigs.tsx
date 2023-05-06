import {
	useEffect,
	useState
}                    from "react";
import { tRPC_Auth } from "@app/Lib/tRPC";

export function useArkServerConfigs(
	InstanceName : string
) {
	const [ ConfigFiles, setConfigFiles ] = useState<Record<string, string>>(
		() => ( {} )
	);
	const [ ConfigContent, setConfigContent ] = useState<string>( "" );
	const [ ReqConfigFile, setReqConfigFile ] = useState( () => "" );

	useEffect( () => {
		const GetConfigFiles = async() => {
			await tRPC_Auth.server.config.getConfigClearText.query( {
				file: ReqConfigFile,
				instanceName: InstanceName
			} ).then( setConfigContent ).catch( () => {
			} );
		};

		GetConfigFiles();
	}, [ InstanceName, ReqConfigFile ] );

	useEffect( () => {
		const GetConfigFiles = async() => {
			await tRPC_Auth.server.config.getConfigs.query( { instanceName: InstanceName } ).then( setConfigFiles ).catch( () => {
			} );
		};

		GetConfigFiles();
	}, [ InstanceName ] );

	return {
		RequestConfigContent: setReqConfigFile,
		ConfigFiles,
		CurrentFile: ReqConfigFile,
		ConfigContent
	};
}
