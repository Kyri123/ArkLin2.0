
import { SocketIOLib } from "@/src/Lib/Api/SocketIO.Lib";
import FormatLog from "@comp/FormatLog";
import type { SystemUsage } from "@server/MongoDB/MongoUsage";
import type { FC } from "react";
import {
	useEffect,
	useMemo,
	useState
} from "react";
import { Modal } from "react-bootstrap";
import type { SingleValue } from "react-select";
import Select from "react-select";


interface IPanelLogProps {
	Show: boolean,
	onHide: () => void,
	usage: SystemUsage
}

const PanelLog: FC<IPanelLogProps> = ( { Show, onHide, usage } ) => {
	const [ logData, setLogData ] = useState<string[]>( [] );
	const [ selected, setSelected ] = useState<SingleValue<{ label: string, value: string }>>( {
		label: usage.LogFiles[ 0 ].split( "/" ).at( -1 )!,
		value: usage.LogFiles[ 0 ]
	} );

	useEffect( () => {
		if( Show ) {
			const socket = SocketIOLib.getSocket( selected?.value || "/room" );
			const onFileUpdated = ( path: string, data: string[] ) => setLogData( data );
			socket.on( "onFileUpdated", onFileUpdated );
			return () => {
				socket.off( "onFileUpdated", onFileUpdated );
				socket.close();
			};
		}
	}, [ Show, selected ] );

	const options = useMemo( () => usage.LogFiles.map( path => ( {
		label: path.split( "/" ).at( -1 )!,
		value: path
	} ) ), [ usage.LogFiles ] );

	return (
		<Modal centered
			size="xl"
			show={ Show }
			onHide={ onHide }
			aria-labelledby="PanelLog-modal">
			<Modal.Header closeButton>
				<Modal.Title id="example-modal-sizes-title-sm">Panel Log</Modal.Title>
			</Modal.Header>
			<Modal.Body className="bg-dark p-0"
				style={ { height: 700, overflow: "auto" } }>
				<FormatLog logContent={ [ ...logData ].reverse().join( "\n" ) } />
			</Modal.Body>
			<Modal.Footer>
				<Select className="w-full" value={ selected } options={ options } onChange={ setSelected } />
			</Modal.Footer>
		</Modal>
	);
};

export default PanelLog;
