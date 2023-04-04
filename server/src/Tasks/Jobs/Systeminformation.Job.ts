import { JobTask }        from "../TaskManager";
import * as Si            from "systeminformation";
import { ISystemUsage }   from "../../../../src/Shared/Type/Systeminformation";
import fetch              from 'node-fetch';
import {
	ConfigManager,
	SSHManager
}                         from "../../Lib/ConfigManager.Lib";
import * as console       from "console";
import { IGitlabRelease } from "../../../../src/Shared/Type/Gitlab.Release";
import { IGitlabCommit }  from "../../../../src/Shared/Type/Gitlab.Commit";
import fs                 from "fs";
import path               from "path";
import DB_GitlabReleases  from "../../MongoDB/DB_GitlabReleases";
import DB_Usage           from "../../MongoDB/DB_Usage";

export default new JobTask( ConfigManager.GetTaskConfig.SystemInformationInterval, "Systeminformation", async( CallCount : number ) => {
	SystemLib.DebugLog( "[TASKS] Running Task", SystemLib.ToBashColor( "Red" ), "Systeminformation" );

	const CPU = await Si.currentLoad();
	const DISK = await Si.fsSize();
	const MEM = await Si.mem();

	const Usage = await DB_Usage.findOne<ISystemUsage>() || {} as any;

	const NewUsage : ISystemUsage = {
		UpdateIsRunning: false,
		PanelNeedUpdate: Usage.PanelNeedUpdate || false,
		NextPanelBuildVersion: Usage.NextPanelBuildVersion || "",
		PanelBuildVersion: fs.readFileSync( path.join( __git_dir, "HEAD" ) ).toString().trim().replaceAll( " ", "" ),
		PanelVersionName: `${ process.env.npm_package_version }`,
		CPU: CPU.currentLoad,
		DiskMax: Usage.DiskMax || 0,
		DiskUsed: Usage.DiskUsed || 0,
		MemMax: MEM.total,
		MemUsed: MEM.total - MEM.available,
		...Usage
	};

	if ( CallCount % 10 === 1 ) {
		try {
			const GitlabCommitLink = "https://git.kyrium.space/api/v4/projects/2/repository/commits/?ref_name=" + ConfigManager.GetDashboardConifg.PANEL_Branch;
			const GitlabLink = "https://git.kyrium.space/api/v4/projects/2/releases/";

			const SHUpdateFile = '~/KAdmin/KAdmin-ArkLIN2/sh/start.sh';
			const Branch = ConfigManager.GetDashboardConifg.PANEL_Branch;

			const Respone = await fetch( GitlabLink ).catch( console.error );
			const CommitRespone = await fetch( GitlabCommitLink ).catch( console.error );

			if ( Respone && CommitRespone ) {
				const Data : IGitlabRelease[] = await Respone.json();
				const CommitData : IGitlabCommit[] = await CommitRespone.json();
				if ( Data[ 0 ] && CommitData[ 0 ] ) {
					NewUsage.NextPanelBuildVersion = Data[ 0 ].name;
					NewUsage.PanelNeedUpdate = CommitData[ 0 ].id.trim() !== ConfigManager.GetGitHash.trim();
				}

				for ( const Release of Data ) {
					await DB_GitlabReleases.findOneAndUpdate( ( e : IGitlabRelease ) => {
						return e.Commit.id === Release.Commit.id
					}, Release, { upsert: true, strict: false } )
				}
			}

			if ( NewUsage.PanelNeedUpdate && !NewUsage.UpdateIsRunning ) {
				NewUsage.UpdateIsRunning = true;
				SSHManager.ExecCommandInScreen( "ArkLinUpdate", `${ SHUpdateFile } ${ Branch }` );
			}
		}
		catch ( e ) {
			console.log( e )
		}
	}

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