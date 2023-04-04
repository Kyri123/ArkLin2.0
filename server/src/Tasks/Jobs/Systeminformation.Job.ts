import { JobTask }       from "../TaskManager";
import * as Si           from "systeminformation";
import { ISystemUsage }  from "../../../../src/Shared/Type/Systeminformation";
import { ConfigManager } from "../../Lib/ConfigManager.Lib";
import DB_Usage          from "../../MongoDB/DB_Usage";
import { Octokit }       from "octokit";

const octokit = new Octokit( {
	auth: ''
} )

export default new JobTask( ConfigManager.GetTaskConfig.SystemInformationInterval, "Systeminformation", async( CallCount : number ) => {
	SystemLib.DebugLog( "[TASKS] Running Task", SystemLib.ToBashColor( "Red" ), "Systeminformation" );

	const CPU = await Si.currentLoad();
	const DISK = await Si.fsSize();
	const MEM = await Si.mem();

	const Usage = await DB_Usage.findOne<ISystemUsage>() || {} as any;

	const NewUsage : ISystemUsage = {
		UpdateIsRunning: false,
		NextPanelBuildVersion: Usage.NextPanelBuildVersion || "",
		PanelBuildVersion: process.env.npm_package_version,
		PanelVersionName: `${ process.env.npm_package_version }`,
		CPU: CPU.currentLoad,
		DiskMax: Usage.DiskMax || 0,
		DiskUsed: Usage.DiskUsed || 0,
		MemMax: MEM.total,
		MemUsed: MEM.total - MEM.available,
		...Usage,
		PanelNeedUpdate: __PANNELUPDATE
	};

	for ( const Drive of DISK ) {
		if ( Drive.mount === "/" ) {
			NewUsage.DiskMax = Drive.size;
			NewUsage.DiskUsed = Drive.used;
		}
	}

	if ( NewUsage.DiskMax === 0 ) {
		NewUsage.DiskMax = DISK[ 0 ].size;
		NewUsage.DiskUsed = DISK[ 0 ].used;
	}

	await DB_Usage.findOneAndUpdate( {}, NewUsage, { upsert: true } );
	SocketIO.emit( "OnSystemUpdate", NewUsage );
} );