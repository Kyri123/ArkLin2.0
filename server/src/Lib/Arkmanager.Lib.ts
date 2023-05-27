import type { InstanceData } from "@app/Types/ArkSE";
import { MakeRandomString } from "@kyri123/k-javascript-utils";
import fs from "fs";
import path from "path";
import { toRealDir } from "./pathBuilder.Lib";


export function configToJSON( Content: string ): Partial<InstanceData> {
	const instanceData: Partial<InstanceData> = {
		Flags: {},
		Options: {}
	};

	const clearInstance: string[] = Content.split( "\n" );
	for( let line = 0; line < clearInstance.length; ++line ) {
		const [ dataKey, rawDataValue ] = clearInstance[ line ].split( "#" )[ 0 ]
			.trim()
			.split( "=", 2 ) as any[];
		if( dataKey.trim().slice( 0, 1 ) === "#" || !dataKey || !rawDataValue ) {
			continue;
		}

		let dataValue = rawDataValue.replaceAll( "'", "" );

		if( dataKey === "ark_GameModIds" ) {
			dataValue = dataValue.split( "," )
				.map( E => parseInt( E ) )
				.filter( e => !isNaN( e ) );
			dataValue = [ ...new Set( dataValue ) ];
		} else if( dataKey.slice( 0, 7 ) === "arkopt_" && instanceData.Options ) {
			const key = dataKey.replace( "arkopt_", "" );
			instanceData.Options[ key ] = dataValue;
			continue;
		} else if( dataKey.slice( 0, 8 ) === "arkflag_" && instanceData.Flags ) {
			const key = dataKey.replace( "arkflag_", "" );
			instanceData.Flags[ key ] = dataValue;
			continue;
		} else if( dataValue.trim() === "" ) {
			// SKIP!
		} else if( !isNaN( Number( dataValue ) ) ) {
			dataValue = Number( dataValue );
		} else if( dataValue === "True" ) {
			dataValue = true;
		} else if( dataValue === "False" ) {
			dataValue = false;
		}

		instanceData[ dataKey ] = dataValue;
	}

	return instanceData;
}

export function jsonToConfig( Content: Partial<InstanceData> ): string {
	const lines: string[] = [];

	if( !Content.Options ) {
		Content.Options = {};
	}
	Content.Options.culture = "en";

	for( const [ key, value ] of Object.entries( Content ) ) {
		if( value === "" ) {
			lines.push( `${ key }='${ value }'` );
		} else if( key === "Flags" || key === "Options" ) {
			for( const [ extraKey, extraValue ] of Object.entries( value ) ) {
				lines.push(
					`${
						key === "Flags" ? "arkflag_" : "arkopt_"
					}${ extraKey }='${ extraValue }'`
				);
			}
		} else if( Array.isArray( value ) ) {
			lines.push( `${ key }='${ ( value as number[] ).join( "," ) }'` );
		} else if( typeof value === "boolean" ) {
			lines.push( `${ key }='${ value ? "True" : "False" }'` );
		} else {
			lines.push( `${ key }='${ value }'` );
		}
	}

	return lines.join( "\n" );
}

export function getDefaultInstanceData( Servername: string ): InstanceData {
	return {
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
		arkbackupdir: toRealDir( path.join( SERVERBACKUPDIR, Servername ) ),
		arkserverroot: toRealDir( path.join( SERVERDIR, Servername ) ),
		logdir: toRealDir( path.join( SERVERLOGSDIR, Servername ) ),
		arkStagingDir: toRealDir( path.join( SERVERBACKUPDIR, "Staging" ) ),
		arkserverexec: "ShooterGame/Binaries/Linux/ShooterGameServer",
		arkwarnminutes: 0,
		serverMap: "TheIsland",
		serverMapModId: "",
		panel_publicip: SERVERIP
	};
}

export function fillWithDefaultValues(
	Servername: string,
	Content: Partial<InstanceData>
): InstanceData {
	if( global.SERVERIP ) {
		Content.panel_publicip = SERVERIP;
	}

	try {
		fs.mkdirSync( path.join( SERVERDIR, Servername ), { recursive: true } );
		fs.mkdirSync( path.join( SERVERBACKUPDIR, Servername ), { recursive: true } );
		fs.mkdirSync( path.join( SERVERLOGSDIR, Servername ), { recursive: true } );
	} catch( e ) {
		if( e instanceof Error ) {
			SystemLib.debugLog( "Fill Dir Error", e.message );
		}
	}

	return {
		...getDefaultInstanceData( Servername ),
		...Content,
		arkbackupdir: toRealDir( path.join( SERVERBACKUPDIR, Servername ) ),
		arkserverroot: toRealDir( path.join( SERVERDIR, Servername ) ),
		logdir: toRealDir( path.join( SERVERLOGSDIR, Servername ) ),
		arkStagingDir: toRealDir( path.join( SERVERBACKUPDIR, "Staging" ) )
	};
}
