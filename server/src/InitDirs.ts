import path from "path";

global.__basedir = path.join( __dirname, "./../.." );
global.__LogDir = path.join( __basedir, "/mount/PanelLogs/" );
global.__LogFile = path.join(
	__LogDir,
	`${ Math.round( new Date().getTime() / 1000 ) }.log`
);
global.__configdir = path.join( __basedir, "mount/config" );
global.__PackageJson = require( path.join( __basedir, "package.json" ) );
global.__server_dir = path.join( __basedir, "mount/Server" );
global.__server_arkmanager = path.join( __basedir, "mount/Arkmanager" );
global.__server_logs = path.join( __basedir, "mount/Logs" );
global.__server_backups = path.join( __basedir, "mount/Backups" );
global.__SteamCMD = path.join( __basedir, "mount/steamCMD" );
global.__git_dir = path.join( __basedir, "mount/Git/" );