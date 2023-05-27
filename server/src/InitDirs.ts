import path from "path";


global.BASEDIR = path.join( __dirname, "./../.." );
global.LOGDIR = path.join( BASEDIR, "/mount/PanelLogs/" );
global.LOGFILE = path.join(
	LOGDIR,
	`${ Math.round( new Date().getTime() / 1000 ) }.log`
);
global.CONFIGDIR = path.join( BASEDIR, "mount/config" );
global.PACKAGE = require( path.join( BASEDIR, "package.json" ) );
global.SERVERDIR = path.join( BASEDIR, "mount/Server" );
global.CLUSTERDIR = path.join( BASEDIR, "mount/Server/cluster" );
global.SERVERARKMANAGER = path.join( BASEDIR, "mount/Arkmanager" );
global.SERVERLOGSDIR = path.join( BASEDIR, "mount/Logs" );
global.SERVERBACKUPDIR = path.join( BASEDIR, "mount/Backups" );
global.STEAMCMDDIR = path.join( BASEDIR, "mount/steamCMD" );
global.GITDIR = path.join( BASEDIR, "mount/Git/" );
