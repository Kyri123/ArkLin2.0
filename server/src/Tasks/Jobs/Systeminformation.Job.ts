import { configManager } from "@/server/src/Lib/configManager.Lib";
import { BC } from "@/server/src/Lib/system.Lib";
import MongoUsage from "@server/MongoDB/MongoUsage";
import fs from "fs";
import path from "path";
import * as Si from "systeminformation";
import { JobTask } from "../taskManager";


export default new JobTask(
	configManager.getTaskConfig.SystemInformationInterval,
	"Systeminformation",
	async() => {
		SystemLib.debugLog(
			"TASKS", "Running Task",
			BC( "Red" ),
			"Systeminformation"
		);

		const space = fs.statfsSync( SERVERDIR );

		const CPU = await Si.currentLoad();
		const MEM = await Si.mem();

		let usage = await MongoUsage.findOne();
		if( !usage ) {
			usage = new MongoUsage();
		}

		usage.UpdateIsRunning = false;
		usage.NextPanelBuildVersion = usage.NextPanelBuildVersion || "",
		usage.PanelBuildVersion = process.env.npm_package_version || "2.0.0",
		usage.PanelVersionName = `${ process.env.npm_package_version }`,
		usage.CPU = CPU.currentLoad,
		usage.DiskMax = space.bsize * space.bfree,
		usage.DiskUsed = space.bsize * space.bfree - space.bsize * space.bavail,
		usage.MemMax = MEM.total,
		usage.MemUsed = MEM.total - MEM.available,
		usage.LogFiles = fs.readdirSync( LOGDIR ).map( e => path.join( LOGDIR, e ) ).reverse(),
		usage.PanelNeedUpdate = PANELUPDATE;

		await usage.save();
		SocketIO.emit( "onSystemUpdate", usage );
	}
);
