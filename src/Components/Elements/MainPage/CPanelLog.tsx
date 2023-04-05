import {
	useEffect,
	useState
}                       from "react";
import { API_PanelLib } from "../../../Lib/Api/API_Panel.Lib";
import {
	IEmitEvents,
	IListenEvents
}                       from "../../../Shared/Type/Socket";
import io, { Socket }   from "socket.io-client";
import { Modal }        from "react-bootstrap";
import { SocketIOLib }  from "../../../Lib/Api/SocketIO.Lib";
import CFormatLog       from "../Server/CFormatLog";
 
interface IPanelLogProps {
	Show : boolean;
	OnHide : () => void;
}


const SocketIO : Socket<IEmitEvents, IListenEvents> = io( SocketIOLib.GetSpocketHost() );
export default function CPanelLog( Props : IPanelLogProps ) {
	const [ LogData, setLogData ] = useState<string[]>( [] );

	useEffect( () => {
		const GetData = async() => {
			setLogData( ( await API_PanelLib.GetLog() ) );
		}
		GetData();
	}, [] );

	useEffect( () => {
		SocketIO.on( "OnPanelLogUpdated", Data => setLogData( Data ) );
		return () => {
			SocketIO.off( "OnPanelLogUpdated" );
		}
	}, [] );

	return (
		<Modal centered size="xl" show={ Props.Show } onHide={ Props.OnHide } aria-labelledby="PanelLog-modal">
			<Modal.Header closeButton>
				<Modal.Title id="example-modal-sizes-title-sm">
					Panel Log
				</Modal.Title>
			</Modal.Header>
			<Modal.Body className="bg-dark p-0" style={ { height: 700, overflow: "auto" } }>
				<CFormatLog LogContent={ [ ...LogData ].reverse().join( "\n" ) }/>
			</Modal.Body>
		</Modal>
	);
}
