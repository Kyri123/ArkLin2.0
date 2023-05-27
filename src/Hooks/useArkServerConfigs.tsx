import { apiAuth } from "@app/Lib/tRPC";
import {
	useEffect,
	useState
} from "react";


export function useArkServerConfigs(
	InstanceName: string
) {
	const [ configFiles, setConfigFiles ] = useState<Record<string, string>>(
		() => ( {} )
	);
	const [ configContent, setConfigContent ] = useState<string>( "" );
	const [ reqConfigFile, setReqConfigFile ] = useState( () => "" );

	useEffect( () => {
		const getConfigFiles = async() => {
			await apiAuth.server.config.getConfigClearText.query( {
				file: reqConfigFile,
				instanceName: InstanceName
			} ).then( setConfigContent ).catch( () => {
			} );
		};

		getConfigFiles();
	}, [ InstanceName, reqConfigFile ] );

	useEffect( () => {
		const getConfigFiles = async() => {
			await apiAuth.server.config.getConfigs.query( { instanceName: InstanceName } ).then( setConfigFiles ).catch( () => {
			} );
		};

		getConfigFiles();
	}, [ InstanceName ] );

	return {
		RequestConfigContent: setReqConfigFile,
		configFiles,
		currentFile: reqConfigFile,
		configContent
	};
}
