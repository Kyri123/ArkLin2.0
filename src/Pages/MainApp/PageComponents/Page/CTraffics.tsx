import bytes            from "bytes";
import type { ISystemUsage } from "../../../../Shared/Type/Systeminformation";
import { CStateCard }   from "../../../Components/Elements/AdminLTE/AdminLTE_Cards";
import {
	Col,
	Row
}                       from "react-bootstrap";

export default function CTraffics( Props : {
	ServerState : [ number, number, number ];
	SystemUsage : ISystemUsage;
} ) {
	return (
		<Row className="mb-3" id="traffics">
			<Col md={ 3 } sm={ 6 } col={ 12 }>
				<CStateCard
					BarColor={ "danger" }
					BarPercent={ Props.SystemUsage.CPU }
					Title={ "Prozessor" }
					Color={ "success" }
					Icon={ "microchip" }
				>
					{ Math.round( Props.SystemUsage.CPU * 100 ) / 100 } <small>%</small>
				</CStateCard>
			</Col>

			<Col md={ 3 } sm={ 6 } col={ 12 }>
				<CStateCard
					BarColor={ "danger" }
					BarPercent={
						( Props.SystemUsage.MemUsed / Props.SystemUsage.MemMax ) * 100
					}
					Title={ "Arbeitsspeicher" }
					Color={ "primary" }
					Icon={ "memory" }
				>
					{ bytes( Props.SystemUsage.MemUsed ) } <small>/</small>{ " " }
					{ bytes( Props.SystemUsage.MemMax ) }
				</CStateCard>
			</Col>

			<Col md={ 3 } sm={ 6 } col={ 12 }>
				<CStateCard
					BarColor={ "danger" }
					BarPercent={
						( Props.SystemUsage.DiskUsed / Props.SystemUsage.DiskMax ) * 100
					}
					Title={ "Speicher" }
					Color={ "danger" }
					Icon={ "hard-drive" }
				>
					{ bytes( Props.SystemUsage.DiskUsed ) } <small>/</small>{ " " }
					{ bytes( Props.SystemUsage.DiskMax ) }
				</CStateCard>
			</Col>

			<Col md={ 3 } sm={ 6 } col={ 12 }>
				<CStateCard
					BarColor={ "success" }
					BarPercent={
						Props.ServerState[ 2 ] !== 0
							? ( Props.ServerState[ 0 ] / Props.ServerState[ 2 ] ) * 100
							: 100
					}
					Title={ "Server" }
					Color={ "secondary" }
					Icon={ "server" }
				>
					<span className="text-success">{ Props.ServerState[ 0 ] }</span> /{ " " }
					<span className="text-danger">{ Props.ServerState[ 1 ] }</span> /{ " " }
					<span className="text-primary">{ Props.ServerState[ 2 ] }</span>
				</CStateCard>
			</Col>
		</Row>
	);
}
