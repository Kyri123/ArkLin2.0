import type { FC }   from "react";
import {
	useEffect,
	useState
}                    from "react";
import { Modal }     from "react-bootstrap";
import { GetSocket } from "@app/Lib/socketIO";
import FormatLog     from "@comp/FormatLog";

interface IPanelLogProps {
	Show : boolean;
	OnHide : () => void;
}

const PanelLog : FC<IPanelLogProps> = ( { Show, OnHide } ) => {
	const [ LogData, setLogData ] = useState<string[]>( [] );

	useEffect( () => {
		if ( Show ) {
			const Socket = GetSocket( "panelLog" );
			Socket.on( "OnPanelLogUpdated", ( Data ) => setLogData( Data ) );
			return () => {
				Socket.off( "OnPanelLogUpdated" );
				Socket.close();
			};
		}
	}, [ Show ] );

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
		</Modal>
	);
};

export default PanelLog;