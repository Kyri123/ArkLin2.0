import type {
	IAPI_BaseConfig,
	IDashboard_BaseConfig,
	IDebugConfig,
	ITaskConfig
}                        from "../Types/Config";
import path              from "path";
import fs                from "fs";
import { SSHLib }        from "./SSH.Lib";
import DB_GithubBranches from "@server/MongoDB/DB_GithubBranches";
import { BC }            from "@server/Lib/System.Lib";

export async function GetCurrentBranch() : Promise<[ string, string | undefined ]> {
	let Branch = ConfigManager.GetDashboardConifg.PANEL_Branch;

	const CurrentBranch = await DB_GithubBranches.findOne( { name: Branch } );
	let Sha : string | undefined = undefined;
	if ( !CurrentBranch ) {
		ConfigManager.Write<IDashboard_BaseConfig>( "Dashboard_BaseConfig", {
			...ConfigManager.GetDashboardConifg,
			PANEL_Branch: "main"
		} );
		Branch = "main";
	}
	else {
		Sha = CurrentBranch.sha;
	}

	return [ Branch, Sha ];
}

export class ConfigManagerClass {
	protected readonly Dashboard_BaseConfig : IDashboard_BaseConfig;
	protected readonly API_BaseConfig : IAPI_BaseConfig;
	protected readonly TaskConfig : ITaskConfig;
	protected readonly DebugConfig : IDebugConfig;
	protected readonly SSHKey : string;

	constructor() {
		this.DebugConfig = this.ReadConfigWithFallback<IDebugConfig>( "Debug.json" );

		this.Dashboard_BaseConfig =
			this.ReadConfigWithFallback<IDashboard_BaseConfig>(
				"Dashboard_BaseConfig.json"
			);
		// we want to set the Debug mod here on true if we want to

		this.API_BaseConfig = this.ReadConfigWithFallback<IAPI_BaseConfig>(
			"API_BaseConfig.json"
		);
		this.TaskConfig = this.ReadConfigWithFallback<ITaskConfig>( "Tasks.json" );
		this.SSHKey = this.ReadConfigWithFallback<string>( "id_rsa", true );
	}

	public get GetDashboardConifg() : IDashboard_BaseConfig {
		return this.Dashboard_BaseConfig;
	}

	public get GetApiConfig() : IAPI_BaseConfig {
		return this.API_BaseConfig;
	}

	public get GetTaskConfig() : ITaskConfig {
		return this.TaskConfig;
	}

	public get GetDebugConfig() : IDebugConfig {
		return this.DebugConfig;
	}

	public get GetSSHKey() : string {
		return this.SSHKey;
	}

	public get GetSSHKeyPath() : string {
		return path.join( __configdir, "id_rsa" );
	}

	public get GetGitHash() : string | undefined {
		try {
			return fs.readFileSync( path.join( __git_dir, "HEAD" ) ).toString().split( " " )[ 0 ];
		}
		catch ( e ) {
		}
		return undefined;
	}

	public Write<T>( Config : string, Data : T ) : boolean {
		const ConfigFile = path.join( __configdir, `${ Config }.json` );
		if ( fs.existsSync( ConfigFile ) && Data ) {
			try {
				fs.writeFileSync( ConfigFile, JSON.stringify( Data, null, "\t" ) );
				return true;
			}
			catch ( e ) {
				SystemLib.LogError( "CONFIG", e );
			}
		}
		return false;
	}

	public Get<T = any>( Config : string ) : any | T {
		const ConfigFile = path.join( __configdir, `${ Config }.json` );
		if ( fs.existsSync( ConfigFile ) ) {
			try {
				return JSON.parse( fs.readFileSync( ConfigFile ).toString() );
			}
			catch ( e ) {
				SystemLib.LogError( "CONFIG", e );
			}
		}
		return {};
	}

	public ReadConfigWithFallback<T>( File : string, NotAJson = false ) : T {
		const FallbackConfigPath = path.join( __basedir, "config", File );
		const ConfigPath = path.join( __configdir, File );

		// Create default config file
		if ( !fs.existsSync( ConfigPath ) ) {
			try {
				fs.mkdirSync( __configdir, { recursive: true } );
			}
			catch ( e ) {
			}
			fs.writeFileSync(
				ConfigPath,
				fs.readFileSync( FallbackConfigPath ).toString()
			);
			SystemLib.Log( "config", "Config recreated:", BC( "Red" ), File );
		}

		if ( !NotAJson ) {
			// Merge fallback (with maybe new values) to config file
			const FallbackConfig = JSON.parse(
				fs.readFileSync( FallbackConfigPath ).toString()
			);
			const Config = JSON.parse( fs.readFileSync( ConfigPath ).toString() );

			const FallbackKeys = Object.keys( FallbackConfig );

			const Return = {
				...FallbackConfig,
				...Config
			};

			for ( const Key of Object.keys( Return ) ) {
				if ( !FallbackKeys.includes( Key ) ) {
					SystemLib.DebugLog(
						"CONFIG", "Removed Key",
						BC( "Red" ),
						Key
					);
					delete Return[ Key ];
				}
			}

			// Save merge
			fs.writeFileSync( ConfigPath, JSON.stringify( Return, null, "\t" ) );

			return Return;
		}
		return fs.readFileSync( ConfigPath ).toString() as T;
	}
}

if ( !global.CManager ) {
	global.CManager = new ConfigManagerClass();
}

export const ConfigManager = global.CManager;

if ( !global.SSHManagerLib ) {
	global.SSHManagerLib = new SSHLib();
}

export const SSHManager = global.SSHManagerLib;
