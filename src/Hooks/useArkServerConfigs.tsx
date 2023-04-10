import {
	useEffect,
	useState
}                        from "react";
import { API_ServerLib } from "../Lib/Api/API_Server.Lib";

export interface IArkServerConfigsHook {
	ConfigFiles : Record<string, string>;
	ConfigContentAsString : string;
	ConfigContent : Record<string, any>;
	CurrentFile : string;
	RequestConfigContent : ( ConfigFile : string ) => void;
	Init : boolean;
}

export function useArkServerConfigs(
	InstanceName : string
) : IArkServerConfigsHook {
	const [ ConfigFiles, setConfigFiles ] = useState<Record<string, string>>(
		() => ( {} )
	);
	const [ ConfigContent, setConfigContent ] = useState<Record<string, any>>(
		() => ( {} )
	);
	const [ ConfigContentAsString, setConfigContentAsString ] = useState<string>(
		() => ""
	);
	const [ ReqConfigFile, setReqConfigFile ] = useState( () => "" );
	const [ Init, setInit ] = useState( () => false );

	useEffect( () => {
		const GetConfigFiles = async() => {
			setConfigFiles( await API_ServerLib.GetConfigFiles( InstanceName ) );
			const [ Obj, AsString ] = await API_ServerLib.GetConfigFromFile(
				InstanceName,
				ReqConfigFile
			);
			setConfigContent( Obj );
			setConfigContentAsString( AsString );
			setInit( true );
		};

		GetConfigFiles();
	}, [ InstanceName, ReqConfigFile ] );

	useEffect( () => {
		API_ServerLib.GetConfigFiles( InstanceName ).then( ( Data ) => {
			if ( Data[ "panel.txt" ] ) {
				setReqConfigFile( Data[ "panel.txt" ] );
				return;
			}
			const First = Object.values( Data )[ 0 ];
			if ( First ) {
				setReqConfigFile( First );
			}
		} );
	}, [ InstanceName ] );

	return {
		RequestConfigContent: setReqConfigFile,
		ConfigContentAsString,
		ConfigContent,
		ConfigFiles,
		Init,
		CurrentFile: ReqConfigFile
	};
}
