import { BC } from "@/server/src/Lib/system.Lib";
import MongoGithubBranches from "@server/MongoDB/MongoGithubBranches";
import fs from "fs";
import path from "path";
import type {
	APIBaseConfig,
	DashboardBaseConfig,
	DebugConfig,
	TaskConfig
} from "../Types/Config";
import { SSHLib } from "./ssh.Lib";


export async function getCurrentBranch(): Promise<[ string, string | undefined ]> {
	let name = configManager.getDashboardConfig.PANEL_Branch;

	const branch = await MongoGithubBranches.findOne( { name } );
	let sha: string | undefined = undefined;
	if( !branch ) {
		configManager.write<DashboardBaseConfig>( "Dashboard_BaseConfig", {
			...configManager.getDashboardConfig,
			PANEL_Branch: "main"
		} );
		name = "main";
	} else {
		sha = branch.sha;
	}

	return [ name, sha ];
}

export class ConfigManagerClass {
	protected readonly Dashboard_BaseConfig: DashboardBaseConfig;
	protected readonly API_BaseConfig: APIBaseConfig;
	protected readonly TaskConfig: TaskConfig;
	protected readonly DebugConfig: DebugConfig;
	protected readonly SSHKey: string;

	constructor() {
		this.DebugConfig = this.readConfigWithfallback<DebugConfig>( "Debug.json" );

		this.Dashboard_BaseConfig =
			this.readConfigWithfallback<DashboardBaseConfig>(
				"Dashboard_BaseConfig.json"
			);
		// we want to set the Debug mod here on true if we want to

		this.API_BaseConfig = this.readConfigWithfallback<APIBaseConfig>(
			"API_BaseConfig.json"
		);
		this.TaskConfig = this.readConfigWithfallback<TaskConfig>( "Tasks.json" );
		this.SSHKey = this.readConfigWithfallback<string>( "id_rsa", true );
	}

	public get getDashboardConfig(): DashboardBaseConfig {
		return this.Dashboard_BaseConfig;
	}

	public get getApiConfig(): APIBaseConfig {
		return this.API_BaseConfig;
	}

	public get getTaskConfig(): TaskConfig {
		return this.TaskConfig;
	}

	public get getDebugConfig(): DebugConfig {
		return this.DebugConfig;
	}

	public get getSSHKey(): string {
		return this.SSHKey;
	}

	public get getSSHKeyPath(): string {
		return path.join( CONFIGDIR, "id_rsa" );
	}

	public get getGitHash(): string | undefined {
		try {
			return fs.readFileSync( path.join( GITDIR, "HEAD" ) ).toString().split( " " )[ 0 ];
		} catch( e ) {
		}
		return undefined;
	}

	public write<T>( Config: string, Data: T ): boolean {
		const configFile = path.join( CONFIGDIR, `${ Config }.json` );
		if( fs.existsSync( configFile ) && Data ) {
			try {
				fs.writeFileSync( configFile, JSON.stringify( Data, null, "\t" ) );
				return true;
			} catch( e ) {
				SystemLib.logError( "CONFIG", e );
			}
		}
		return false;
	}

	public get<T = any>( Config: string ): any | T {
		const configFile = path.join( CONFIGDIR, `${ Config }.json` );
		if( fs.existsSync( configFile ) ) {
			try {
				return JSON.parse( fs.readFileSync( configFile ).toString() );
			} catch( e ) {
				SystemLib.logError( "CONFIG", e );
			}
		}
		return {};
	}

	public readConfigWithfallback<T>( File: string, NotAJson = false ): T {
		const fallbackConfigPath = path.join( BASEDIR, "config", File );
		const configPath = path.join( CONFIGDIR, File );

		// Create default config file
		if( !fs.existsSync( configPath ) ) {
			try {
				fs.mkdirSync( CONFIGDIR, { recursive: true } );
			} catch( e ) {
			}
			fs.writeFileSync(
				configPath,
				fs.readFileSync( fallbackConfigPath ).toString()
			);
			SystemLib.log( "config", "Config recreated:", BC( "Red" ), File );
		}

		if( !NotAJson ) {
			// Merge fallback (with maybe new values) to config file
			const fallbackConfig = JSON.parse(
				fs.readFileSync( fallbackConfigPath ).toString()
			);
			const config = JSON.parse( fs.readFileSync( configPath ).toString() );

			const fallbackKeys = Object.keys( fallbackConfig );

			const result = {
				...fallbackConfig,
				...config
			};

			for( const key of Object.keys( result ) ) {
				if( !fallbackKeys.includes( key ) ) {
					SystemLib.debugLog(
						"CONFIG", "Removed Key",
						BC( "Red" ),
						key
					);
					delete result[ key ];
				}
			}

			// Save merge
			fs.writeFileSync( configPath, JSON.stringify( result, null, "\t" ) );

			return result;
		}
		return fs.readFileSync( configPath ).toString() as T;
	}
}

if( !global.CManager ) {
	global.CManager = new ConfigManagerClass();
}

export const configManager = global.CManager;

if( !global.sshManagerLib ) {
	global.sshManagerLib = new SSHLib();
}

export const sshManager = global.sshManagerLib;
