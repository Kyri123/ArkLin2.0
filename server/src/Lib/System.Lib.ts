import process          from "process";
import os               from "os";
import Util             from "util";
import fs               from "fs";
import {
	BashColorString,
	SystemPlatform
}                       from "../Types/System.Lib";
import { InstallAllTE } from "../TypeExtension/TE_InstallAll";
import * as console     from "console";
import * as dotenv      from "dotenv";
import { IDebugConfig } from "../Types/Config";

export class SystemLib_Class {
	public readonly IsDevMode : boolean;
	private UseDebug : boolean;
	private readonly Platform : SystemPlatform;
	private readonly SuportedPlatforms : SystemPlatform[];
	private DebugConfig : IDebugConfig = {
		FilterDebug: [],
		UseDebug: false
	};

	constructor( Supported : SystemPlatform[] ) {
		this.IsDevMode = process.argv[ 2 ] === "true";
		this.UseDebug =
			process.argv[ 2 ] === "true" ||
			process.argv[ 2 ] === "Debug" ||
			process.argv[ 2 ] === "development";
		this.Platform =
			os.platform() === "linux"
				? "Lin"
				: os.platform() === "win32"
					? "Win"
					: "NotSupported";

		this.DebugLog( "[SYSTEM] Try to load:", ".env" );
		dotenv.config();
		if ( process.argv[ 2 ] ) {
			this.DebugLog( "[SYSTEM] Try to load:", ".env." + process.argv[ 2 ] );
			dotenv.config( {
				path: ".env." + process.argv[ 2 ]
			} );
		}

		if ( process.argv[ 2 ] === "TestServer" ) {
			this.Platform = "Test";
		}

		this.SuportedPlatforms = Supported;
		InstallAllTE();
		if ( !this.SuportedPlatforms.Contains( this.Platform ) && !this.IsTest() ) {
			this.Platform = "NotSupported";
		}
	}

	public DebugMode() : boolean {
		return this.UseDebug || this.IsTest();
	}

	public SetDebugConfig( NewMode : IDebugConfig ) {
		this.DebugConfig = NewMode;
		this.UseDebug = NewMode.UseDebug || process.argv[ 2 ] === "development";
	}

	public ToBashColor( String : BashColorString ) {
		switch ( String ) {
			case "Black":
				return "\x1B[30m";
			case "Cyan":
				return "\x1B[36m";
			case "Dark Gray":
				return "\x1B[90m";
			case "Light Cyan":
				return "\x1B[96m";
			case "Light Gray":
				return "\x1B[37m";
			case "Light Green":
				return "\x1B[32m";
			case "Light Magenta":
				return "\x1B[35m";
			case "Light Red":
				return "\x1B[91m";
			case "Light Yellow":
				return "\x1B[93m";
			case "Red":
				return "\x1B[31m";
			case "Green":
				return "\x1B[32m";
			case "Yellow":
				return "\x1B[33m";
			case "Blue":
				return "\x1B[34m";
			case "Magenta":
				return "\x1B[35m";
			case "White":
				return "\x1B[97m";
			default:
				return "\x1B[39m";
		}
	}

	public ClearANSI( Log : string ) : string {
		return Log.replaceAll(
			/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
			""
		);
	}

	public WriteStringToLog( ...Log : any[] ) : void {
		Log.push( "\n" );
		const OutLog : string = Util.format( ...Log );
		let CurrentLog = "";
		if ( fs.existsSync( __LogFile ) ) {
			CurrentLog = fs.readFileSync( __LogFile ).toString();
		}
		CurrentLog = CurrentLog + OutLog;
		fs.writeFileSync( __LogFile, this.ClearANSI( CurrentLog ) );

		if ( global.SocketIO ) {
			SocketIO.emit(
				"OnPanelLogUpdated",
				this.ClearANSI( CurrentLog ).split( "\n" ).reverse()
			);
		}
	}

	public DebugLog( ...data : any[] ) {
		const OutLog : string = Util.format( ...data );
		for ( const Filter of this.DebugConfig.FilterDebug ) {
			if ( OutLog.includes( `[${ Filter.toUpperCase() }]` ) ) {
				return;
			}
		}

		if ( this.DebugMode() ) {
			data.AddFirst(
				this.ToBashColor( "Magenta" ) +
				`[${ new Date().toUTCString() }][DEBUG]\x1B[0m`
			);
			console.log( ...data );
			this.WriteStringToLog( ...data );
		}
	}

	public Log( ...data : any[] ) {
		data.AddFirst(
			this.ToBashColor( "Cyan" ) + `[${ new Date().toUTCString() }][LOG]\x1B[0m`
		);
		console.log( ...data );
		this.WriteStringToLog( ...data );
	}

	public LogError( ...data : any[] ) {
		data.AddFirst(
			this.ToBashColor( "Light Red" ) +
			`[${ new Date().toUTCString() }][ERROR]\x1B[0m`
		);
		console.error( ...data );
		this.WriteStringToLog( ...data );
	}

	public LogWarning( ...data : any[] ) {
		data.AddFirst(
			this.ToBashColor( "Yellow" ) + `[${ new Date().toUTCString() }][WARN]\x1B[0m`
		);
		console.warn( ...data );
		this.WriteStringToLog( ...data );
	}

	public LogFatal( ...data : any[] ) {
		data.AddFirst(
			this.ToBashColor( "Red" ) + `[${ new Date().toUTCString() }][FATAL]\x1B[0m`
		);
		console.error( ...data );
		this.WriteStringToLog( ...data );
		process.exit();
	}

	public CustomLog(
		Color : BashColorString,
		Key : string,
		IsFata : boolean,
		...data : any[]
	) {
		data.AddFirst(
			this.ToBashColor( Color ) + `[${ new Date().toUTCString() }][${ Key }]\x1B[0m`
		);
		console.error( ...data );
		this.WriteStringToLog( ...data );
		if ( IsFata ) {
			process.exit();
		}
	}

	public IsWin() : boolean {
		return this.Platform === "Win";
	}

	public IsLin() : boolean {
		return this.Platform === "Lin";
	}

	public IsTest() : boolean {
		return this.Platform === "Test";
	}
}

if ( !global.SystemLib ) {
	global.SystemLib = new SystemLib_Class( [ "Lin" ] );
}
