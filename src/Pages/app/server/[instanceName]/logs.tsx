import { Card }                       from "react-bootstrap";
import FormatLog                      from "@comp/FormatLog";
import Select                         from "react-select";
import { useLoaderData }              from "react-router-dom";
import {
	useEffect,
	useMemo,
	useState
}                                     from "react";
import type { ServerLogsLoaderProps } from "@page/app/loader/server/logs";
import type {
	SelectOption,
	SingleOption
}                                     from "@app/Types/Systeminformation";
import { GetSocket }                  from "@app/Lib/socketIO";

const Component = () => {
	const { logFiles } = useLoaderData() as ServerLogsLoaderProps;
	const options = useMemo( () => Object.entries( logFiles ).map<SelectOption>( ( [ fileName, path ] ) => ( {
		value: path,
		label: fileName
	} ) ), [ logFiles ] );
	const [ selectedFile, setSelectedFile ] = useState<SingleOption>( () => ( options.find( e => e.label === "panel.txt" ) || options.at( 0 ) || null ) );
	const [ LogContent, setLogContent ] = useState<string>( "" );

	useEffect( () => {
		if ( selectedFile ) {
			const Socket = GetSocket( selectedFile?.value || "/room" );
			const onFileUpdated = ( path : string, data : string[] ) => setLogContent( () => data.filter( ( e, i ) => i < 501 ).join( "\n" ) );
			Socket.on( "onFileUpdated", onFileUpdated );
			return () => {
				Socket.off( "onFileUpdated", onFileUpdated );
				Socket.close();
			};
		}
		else {
			setLogContent( () => "" );
		}
	}, [ selectedFile, logFiles ] );

	return (
		<Card>
			<Card.Header className={ "p-0" }>
				<div className="d-flex bd-highlight w-100">
					<div className="p-0 flex-grow-1 bd-highlight">
						<h3 className="card-title p-3">Server Logs</h3>
					</div>
					<div className="p-2 flex-grow-1 bd-highlight">
						<Select
							className={ "w-100" }
							options={ options }
							value={ selectedFile }
							onChange={ setSelectedFile }
						/>
					</div>
				</div>
			</Card.Header>
			<Card.Body
				className={ "bg-dark text-light p-0" }
				style={ { overflowX: "hidden", overflowY: "scroll", maxHeight: 750 } }
			>
				<FormatLog LogContent={ LogContent }/>
			</Card.Body>
		</Card>
	);
};

export { Component };