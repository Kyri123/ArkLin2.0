import path                  from "path";
import fs                    from "fs";
import { MakeRandomString }  from "@kyri123/k-javascript-utils";
import { ToRealDir }         from "./PathBuilder.Lib";
import type { InstanceData } from "@app/Types/ArkSE";

export function ConfigToJSON( Content : string ) : Partial<InstanceData> {
	const InstanceData : Partial<InstanceData> = {
		Flags: {},
		Options: {}
	};

	const ClearInstance : string[] = Content.split( "\n" );
	for ( let Line = 0; Line < ClearInstance.length; ++Line ) {
		const [ DataKey, RawDataValue ] = ClearInstance[ Line ].split( "#" )[ 0 ]
			.trim()
			.split( "=", 2 ) as any[];
		if ( DataKey.trim().slice( 0, 1 ) === "#" || !DataKey || !RawDataValue ) {
			continue;
		}

		let DataValue = RawDataValue.replaceAll( "'", "" );

		if ( DataKey === "ark_GameModIds" ) {
			DataValue = DataValue.split( "," )
				.map( ( E ) => parseInt( E ) )
				.filter( ( e ) => !isNaN( e ) );
			DataValue = [ ...new Set( DataValue ) ];
		}
		else if ( DataKey.slice( 0, 7 ) === "arkopt_" && InstanceData.Options ) {
			const key = DataKey.replace( "arkopt_", "" );
			InstanceData.Options[ key ] = DataValue;
			continue;
		}
		else if ( DataKey.slice( 0, 8 ) === "arkflag_" && InstanceData.Flags ) {
			const key = DataKey.replace( "arkflag_", "" );
			InstanceData.Flags[ key ] = DataValue;
			continue;
		}
		else if ( DataValue.trim() === "" ) {
			// SKIP!
		}
		else if ( !isNaN( Number( DataValue ) ) ) {
			DataValue = Number( DataValue );
		}
		else if ( DataValue === "True" ) {
			DataValue = true;
		}
		else if ( DataValue === "False" ) {
			DataValue = false;
		}

		InstanceData[ DataKey ] = DataValue;
	}

	return InstanceData;
}

export function JSONtoConfig( Content : Partial<InstanceData> ) : string {
	const Lines : string[] = [];

	if ( !Content.Options ) {
		Content.Options = {};
	}
	Content.Options.culture = "en";

	for ( const [ Key, Value ] of Object.entries( Content ) ) {
		if ( Value === "" ) {
			Lines.push( `${ Key }='${ Value }'` );
		}
		else if ( Key === "Flags" || Key === "Options" ) {
			for ( const [ ExtraKey, ExtraValue ] of Object.entries( Value ) ) {
				Lines.push(
					`${
						Key === "Flags" ? "arkflag_" : "arkopt_"
					}${ ExtraKey }='${ ExtraValue }'`
				);
			}
		}
		else if ( Array.isArray( Value ) ) {
			Lines.push( `${ Key }='${ ( Value as number[] ).join( "," ) }'` );
		}
		else if ( typeof Value === "boolean" ) {
			Lines.push( `${ Key }='${ Value ? "True" : "False" }'` );
		}
		else {
			Lines.push( `${ Key }='${ Value }'` );
		}
	}

	return Lines.join( "\n" );
}

export function GetDefaultInstanceData( Servername : string ) : InstanceData {
	const Content = {
		arkMaxBackupSizeMB: 4096,
		arkNoPortDecrement: true,
		arkStartDelay: 0,
		arkautorestartfile: "ShooterGame/Saved/.autorestart",
		arkprecisewarn: true,
		chatCommandRestartCancel: "/cancelupdate",
		discordWebhookURL: "",
		msgWarnCancelled: "Restart cancelled by player request",
		msgWarnRestartMinutes:
			"This ARK server will shutdown for a restart in %d minutes",
		msgWarnRestartSeconds:
			"This ARK server will shutdown for a restart in %d seconds",
		msgWarnShutdownMinutes: "This ARK server will shutdown in %d minutes",
		msgWarnShutdownSeconds: "This ARK server will shutdown in %d seconds",
		msgWarnUpdateMinutes:
			"This ARK server will shutdown for an update in %d minutes",
		msgWarnUpdateSeconds:
			"This ARK server will shutdown for an update in %d seconds",
		noNotifyWarning: true,
		notifyCommand:
			"echo \"$msg\" | mailx -s \"Message from instance ${instance} on server ${HOSTNAME}\" \"email@domain.com\"",
		notifyMsgServerTerminated: "Server exited - restarting",
		notifyMsgServerUp: "Server is up",
		notifyMsgShuttingDown: "Shutting down",
		notifyMsgStarting: "Starting",
		notifyMsgStoppedListening: "Server has stopped listening - restarting",
		notifyTemplate:
			"Message from instance {instance} on server {server}: {msg}",
		Flags: {},
		Options: {
			culture: "en"
		},
		arkAutoUpdateOnStart: true,
		arkBackupPreUpdate: true,
		ark_GameModIds: [],
		ark_MaxPlayers: 70,
		ark_RCONEnabled: true,
		ark_Port: 7778,
		ark_QueryPort: 27015,
		ark_RCONPort: 32330,
		ark_ServerAdminPassword: MakeRandomString( 10, "-" ),
		ark_ServerPassword: "",
		ark_SessionName: "[ARKLIN2] ArkServer",
		ark_TotalConversionMod: "",
		arkbackupcompress: true,
		arkbackupdir: ToRealDir( path.join( __server_backups, Servername ) ),
		arkserverroot: ToRealDir( path.join( __server_dir, Servername ) ),
		logdir: ToRealDir( path.join( __server_logs, Servername ) ),
		arkStagingDir: ToRealDir( path.join( __server_backups, "Staging" ) ),
		arkserverexec: "ShooterGame/Binaries/Linux/ShooterGameServer",
		arkwarnminutes: 0,
		serverMap: "TheIsland",
		serverMapModId: "",
		panel_publicip: __PublicIP
	};

	return Content;
}

export function FillWithDefaultValues(
	Servername : string,
	Content : Partial<InstanceData>
) : InstanceData {
	if ( global.__PublicIP ) {
		Content.panel_publicip = __PublicIP;
	}

	try {
		fs.mkdirSync( path.join( __server_dir, Servername ), { recursive: true } );
		fs.mkdirSync( path.join( __server_backups, Servername ), { recursive: true } );
		fs.mkdirSync( path.join( __server_logs, Servername ), { recursive: true } );
	}
	catch ( e ) {
	}

	return {
		...GetDefaultInstanceData( Servername ),
		...Content,
		arkbackupdir: ToRealDir( path.join( __server_backups, Servername ) ),
		arkserverroot: ToRealDir( path.join( __server_dir, Servername ) ),
		logdir: ToRealDir( path.join( __server_logs, Servername ) ),
		arkStagingDir: ToRealDir( path.join( __server_backups, "Staging" ) )
	};
}
