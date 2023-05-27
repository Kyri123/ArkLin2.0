import { configManager } from "@/server/src/Lib/configManager.Lib";
import { EBashScript } from "@server/Enum/EBashScript";
import * as console from "console";
import * as dotenv from "dotenv";
import fs from "fs";
import process from "process";
import Util from "util";


export async function runUpdate() {
	SystemLib.log( "Update", "Running Update..." );

	const config = configManager.getDashboardConfig;

	await sshManagerLib.execCommandInScreen( "kadminupdate", `${ EBashScript.update } '${ config.PANEL_Branch }'` );
}


export type BashColorString =
	| "Default"
	| "Red"
	| "Black"
	| "Green"
	| "Yellow"
	| "Blue"
	| "Magenta"
	| "Cyan"
	| "Light Gray"
	| "Dark Gray"
	| "Light Red"
	| "Light Green"
	| "Light Yellow"
	| "Light Magenta"
	| "Light Cyan"
	| "White";

export class SystemLibClass {
	public readonly isDevMode: boolean;
	private readonly UseDebug: boolean;

	static isDev(): boolean {
		return process.env.NODE_ENV !== "production" || configManager.getDebugConfig.UseDebug;
	}

	constructor() {
		this.isDevMode = SystemLibClass.isDev();
		this.UseDebug = SystemLibClass.isDev();

		this.debugLog( "SYSTEM", "Try to load:", ".env" );
		dotenv.config();
		if( SystemLibClass.isDev() ) {
			this.debugLog( "SYSTEM", "Try to load:", ".env.development" );
			dotenv.config( {
				path: ".env.development"
			} );
		} else {
			this.debugLog( "SYSTEM", "Try to load:", ".env.local" );
			dotenv.config( {
				path: ".env.local"
			} );
		}
	}

	public debugMode(): boolean {
		return this.UseDebug;
	}

	static TBC( String: BashColorString ) {
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

	public toBashColor( String: BashColorString ) {
		return SystemLibClass.TBC( String );
	}

	public clearANSI( Log: string ): string {
		return Log.replaceAll(
			/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
			""
		);
	}

	public writeStringTolog( ...Log: any[] ): void {
		Log.push( "\n" );
		const outLog: string = Util.format( ...Log );

		let currentLog = "";
		if( fs.existsSync( LOGFILE ) ) {
			currentLog = fs.readFileSync( LOGFILE ).toString();
		}
		currentLog = currentLog + outLog;
		fs.writeFileSync( LOGFILE, this.clearANSI( currentLog ) );
	}

	public debugLog( Prefix: string, ...data: any[] ) {
		if( this.debugMode() ) {
			if( configManager.getDebugConfig.FilterDebug.some( e => `[${ Prefix.toUpperCase() }]`.includes( `[${ e }]`.toUpperCase() ) ) ) {
				return;
			}

			data.addAtIndex(
				`${ this.toBashColor( "Red" ) }[${ Prefix.toUpperCase() }]\x1B[0m`
			);
			data.addAtIndex(
				this.toBashColor( "Magenta" ) +
				`[${ new Date().toUTCString() }][DEBUG]\x1B[0m`
			);
			console.log( ...data );
			this.writeStringTolog( ...data );
		}
	}

	public log( Prefix: string, ...data: any[] ) {
		data.addAtIndex(
			`${ this.toBashColor( "Red" ) }[${ Prefix.toUpperCase() }]\x1B[0m`
		);
		data.addAtIndex(
			this.toBashColor( "Cyan" ) + `[${ new Date().toUTCString() }][LOG]\x1B[0m`
		);
		console.log( ...data );
		this.writeStringTolog( ...data );
	}

	public logError( Prefix: string, ...data: any[] ) {
		data.addAtIndex(
			this.toBashColor( "Light Red" ) +
			`[${ new Date().toUTCString() }][ERROR]\x1B[0m`
		);
		data.addAtIndex(
			`${ this.toBashColor( "Red" ) }[${ Prefix.toUpperCase() }]\x1B[0m`
		);
		console.error( ...data );
		this.writeStringTolog( ...data );
	}

	public logWarning( Prefix: string, ...data: any[] ) {
		data.addAtIndex(
			`${ this.toBashColor( "Red" ) }[${ Prefix.toUpperCase() }]\x1B[0m`
		);
		data.addAtIndex(
			this.toBashColor( "Yellow" ) + `[${ new Date().toUTCString() }][WARN]\x1B[0m`
		);
		console.warn( ...data );
		this.writeStringTolog( ...data );
	}

	public logFatal( Prefix: string, ...data: any[] ) {
		data.addAtIndex(
			`${ this.toBashColor( "Red" ) }[${ Prefix.toUpperCase() }]\x1B[0m`
		);
		data.addAtIndex(
			this.toBashColor( "Red" ) + `[${ new Date().toUTCString() }][FATAL]\x1B[0m`
		);
		console.error( ...data );
		this.writeStringTolog( ...data );
		process.exit();
	}
}

export const BC = SystemLibClass.TBC;
