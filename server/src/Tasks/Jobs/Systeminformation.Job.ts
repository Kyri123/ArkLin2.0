import { JobTask }          from "../TaskManager";
import * as Si              from "systeminformation";
import { ConfigManager }    from "@server/Lib/ConfigManager.Lib";
import type { SystemUsage } from "@server/MongoDB/DB_Usage";
import DB_Usage             from "@server/MongoDB/DB_Usage";
import { BC }               from "@server/Lib/System.Lib";
import fs                   from "fs";
import path                 from "path";

export default new JobTask(
	ConfigManager.GetTaskConfig.SystemInformationInterval,
	"Systeminformation",
	async() => {
		SystemLib.DebugLog(
			"TASKS", "Running Task",
			BC( "Red" ),
			"Systeminformation"
		);

		const space = fs.statfsSync( __server_dir );

		const CPU = await Si.currentLoad();
		const MEM = await Si.mem();

		const Usage = ( await DB_Usage.findOne() )?.toJSON() || ( {} as any );
		delete Usage._id;
		delete Usage.createdAt;
		delete Usage.updatedAt;
		delete Usage.__v;

		const NewUsage : SystemUsage = {
			...Usage,
			UpdateIsRunning: false,
			NextPanelBuildVersion: Usage.NextPanelBuildVersion || "",
			PanelBuildVersion: process.env.npm_package_version,
			PanelVersionName: `${ process.env.npm_package_version }`,
			CPU: CPU.currentLoad,
			DiskMax: space.bsize * space.bfree,
			DiskUsed: space.bsize * space.bfree - space.bsize * space.bavail,
			MemMax: MEM.total,
			MemUsed: MEM.total - MEM.available,
			LogFiles: fs.readdirSync( __LogDir ).map( e => path.join( __LogDir, e ) ).reverse(),
			PanelNeedUpdate: __PANNELUPDATE
		};

		await DB_Usage.findOneAndReplace( {}, NewUsage, {
			upsert: true
		} );
		SocketIO.emit( "OnSystemUpdate", NewUsage );
	}
);
