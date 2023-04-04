import { ISystemUsage } from "../../../Shared/Type/Systeminformation";
import { CStateCard }   from "../AdminLTE/AdminLTE_Cards";
import bytes            from "bytes";

export default function CTraffics( Props : {
	ServerState : [ number, number, number ];
	SystemUsage : ISystemUsage;
} ) {
	return (
		<div className="row mb-3" id="traffics">
			<CStateCard BarColor={ "danger" } BarPercent={ Props.SystemUsage.CPU } Title={ "Prozessor" }
						Color={ "success" } Icon={ "microchip" } className={ "col-12 col-sm-6 col-md-3" }>
				{ Math.round( Props.SystemUsage.CPU * 100 ) / 100 } <small>%</small>
			</CStateCard>

			<CStateCard BarColor={ "danger" } BarPercent={ Props.SystemUsage.MemUsed / Props.SystemUsage.MemMax * 100 }
						className={ "col-12 col-sm-6 col-md-3" }
						Title={ "Arbeitsspeicher" } Color={ "primary" } Icon={ "memory" }>
				{ bytes( Props.SystemUsage.MemUsed ) } <small>/</small> { bytes( Props.SystemUsage.MemMax ) }
			</CStateCard>

			<CStateCard BarColor={ "danger" } className={ "col-12 col-sm-6 col-md-3" }
						BarPercent={ Props.SystemUsage.DiskUsed / Props.SystemUsage.DiskMax * 100 } Title={ "Speicher" }
						Color={ "danger" } Icon={ "hard-drive" }>
				{ bytes( Props.SystemUsage.DiskUsed ) } <small>/</small> { bytes( Props.SystemUsage.DiskMax ) }
			</CStateCard>

			<CStateCard BarColor={ "success" } className={ "col-12 col-sm-6 col-md-3" }
						BarPercent={ Props.ServerState[ 2 ] !== 0 ? Props.ServerState[ 0 ] / Props.ServerState[ 2 ] * 100 : 100 }
						Title={ "Server" } Color={ "secondary" } Icon={ "server" }>
				<span className="text-success">{ Props.ServerState[ 0 ] }</span> / <span
				className="text-danger">{ Props.ServerState[ 1 ] }</span> / <span
				className="text-primary">{ Props.ServerState[ 2 ] }</span>
			</CStateCard>
		</div>
	);
}