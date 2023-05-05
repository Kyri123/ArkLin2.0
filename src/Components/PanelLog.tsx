import type { FC }          from "react";
import {
	useEffect,
	useMemo,
	useState
}                           from "react";
import { Modal }            from "react-bootstrap";
import { GetSocket }        from "@app/Lib/socketIO";
import FormatLog            from "@comp/FormatLog";
import type { SystemUsage } from "@server/MongoDB/DB_Usage";
import type { SingleValue } from "react-select";
import Select               from "react-select";

interface IPanelLogProps {
	Show : boolean;
	OnHide : () => void;
	usage : SystemUsage;
}

const PanelLog : FC<IPanelLogProps> = ( { Show, OnHide, usage } ) => {
	const [ LogData, setLogData ] = useState<string[]>( [] );
	const [ selected, setSelected ] = useState<SingleValue<{ label : string, value : string }>>( {
		label: usage.LogFiles[ 0 ].split( "/" ).at( -1 )!,
		value: usage.LogFiles[ 0 ]
	} );

	useEffect( () => {
		if ( Show ) {
			const Socket = GetSocket( selected?.value || "/room" );
			const onFileUpdated = ( path : string, data : string[] ) => setLogData( data );
			Socket.on( "onFileUpdated", onFileUpdated );
			return () => {
				Socket.off( "onFileUpdated", onFileUpdated );
				Socket.close();
			};
		}
	}, [ Show, selected ] );

	const options = useMemo( () => usage.LogFiles.map( ( path ) => ( {
		label: path.split( "/" ).at( -1 )!,
		value: path
	} ) ), [ usage.LogFiles ] );

	return (
		<Modal
			centered
			size="xl"
			show={ Show }
			onHide={ OnHide }
			aria-labelledby="PanelLog-modal"
		>
			<Modal.Header closeButton>
				<Modal.Title id="example-modal-sizes-title-sm">Panel Log</Modal.Title>
			</Modal.Header>
			<Modal.Body
				className="bg-dark p-0"
				style={ { height: 700, overflow: "auto" } }
			>
				<FormatLog LogContent={ [ ...LogData ].reverse().join( "\n" ) }/>
			</Modal.Body>
			<Modal.Footer>
				<Select className="w-full" value={ selected } options={ options } onChange={ setSelected }/>
			</Modal.Footer>
		</Modal>
	);
};

export default PanelLog;