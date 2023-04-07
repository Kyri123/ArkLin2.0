import {
	IInstanceData,
	IInstanceState,
	IPanelServerConfig
}                              from "../../../src/Shared/Type/ArkSE";
import {
	DefaultInstanceState,
	GetDefaultPanelServerConfig
}                              from "../../../src/Shared/Default/Server.Default";
import path                    from "path";
import fs                      from "fs";
import {
	GetDefaultInstanceData,
	JSONtoConfig
}                              from "./Arkmanager.Lib";
import { SSHManager }          from "./ConfigManager.Lib";
import DB_Instances            from "../MongoDB/DB_Instances";
import { EArkmanagerCommands } from "../../../src/Lib/ServerUtils.Lib";
import * as ini                from "ini";
import {
	IMO_Cluster,
	IMO_Instance
}                              from "../../../src/Shared/Api/MongoDB";
import { MakeRandomID }        from "./PathBuilder.Lib";
import DB_Cluster              from "../MongoDB/DB_Cluster";
import { EBashScript }         from "../Enum/EBashScript";

export async function CreateServer(
	PanelConfig : IPanelServerConfig,
	InstanceName? : string
) : Promise<ServerLib | undefined> {
	const InstanceID = InstanceName || MakeRandomID( 20, true );
	const ConfigFile = path.join(
		__server_arkmanager,
		"instances",
		InstanceID + ".cfg"
	);

	if ( ( await DB_Instances.exists( { Instance: InstanceID } ) ) === null ) {
		const Config : IInstanceData = GetDefaultInstanceData( InstanceID );
		fs.writeFileSync( ConfigFile, JSONtoConfig( Config ) );
		await DB_Instances.create( {
			Instance: InstanceID,
			ArkmanagerCfg: Config,
			State: DefaultInstanceState(),
			PanelConfig: PanelConfig,
			ServerMap: {
				BG: `/img/maps/TheIsland.jpg`,
				LOGO: `/img/maps/TheIsland.jpg`
			}
		} );
		const Lib = new ServerLib( InstanceID );
		if ( await Lib.Init() ) {
			return Lib;
		}
	}

	return undefined;
}

export class ServerLib {
	public readonly Instance : string;
	public readonly InstanceConfigFile : string;
	private MongoDBData : IMO_Instance | null = null;
	private Cluster : IMO_Cluster | null = null;

	constructor( ServerInstance : string ) {
		this.Instance = ServerInstance;
		this.InstanceConfigFile = path.join(
			__server_arkmanager,
			"instances",
			`${ this.Instance }.cfg`
		);
	}

	get Get() : IMO_Instance | null {
		return this.MongoDBData;
	}

	public async Init() : Promise<boolean> {
		try {
			this.MongoDBData = ( await DB_Instances.findOne( {
				Instance: this.Instance
			} ) )!.toJSON();

			const Cluster = await DB_Cluster.findOne( { Instances: this.Instance } );
			this.Cluster = Cluster ? Cluster.toJSON() : null;
		}
		catch ( e ) {
		}
		return this.IsValid();
	}

	public IsInCluster() : boolean {
		return this.Cluster !== null;
	}

	public get GetCluster() : IMO_Cluster | null {
		return this.Cluster;
	}

	public EmitUpdate() {
		if ( this.MongoDBData !== null && this.IsValid() ) {
			SocketIO.emit( "OnServerUpdated", { [ this.Instance ]: this.MongoDBData } );
		}
	}

	public IsValid() : boolean {
		return fs.existsSync( this.InstanceConfigFile ) && this.MongoDBData !== null;
	}

	GetConfig() : IInstanceData {
		if ( !this.IsValid() ) {
			return GetDefaultInstanceData( this.Instance );
		}
		return this.MongoDBData?.ArkmanagerCfg!;
	}

	async ExecuteCommand(
		Command : EArkmanagerCommands,
		Params : string[] = []
	) : Promise<boolean> {
		const State = await this.GetState();
		if ( State.ArkmanagerPID === 0 ) {
			Params.AddFirst( "--dots" );
			fs.mkdirSync( path.join( __server_dir, this.Instance ), { recursive: true } );
			fs.mkdirSync( path.join( __server_logs, this.Instance ), {
				recursive: true
			} );
			fs.mkdirSync( path.join( __server_backups, this.Instance ), {
				recursive: true
			} );

			await this.ModifySubDocument( "State", {
				...this.MongoDBData!.State,
				State: "ActionInProgress",
				ArkmanagerPID: 1
			} );

			SSHManager.ExecCommand(
				[
					`${ EBashScript.arkmanger } "arkmanager ${ Command } ${ Params.join( " " ) }" "${ this.Instance }"`
				].join( " " )
			).then( () => {
			} );
			this.EmitUpdate();
			return true;
			/*SSHManager.ExecCommand( [ "screen", '-dmS', this.Instance, 'bash', '-c', `'${ path.join( process.env.APPEND_BASEDIR, __basedir, "sh/arkmanager.sh" ) } "arkmanager ${ Command } ${ Params.join( " " ) }" "${ this.Instance }"'` ].join( " " ) ).then( () => {} );
			 return true;*/
		}
		return false;
	}

	GetPanelConfig() : IPanelServerConfig {
		if ( this.IsValid() && this.MongoDBData ) {
			return {
				...GetDefaultPanelServerConfig(),
				...this.MongoDBData.PanelConfig
			};
		}
		return GetDefaultPanelServerConfig();
	}

	async ModifySubDocument(
		SubDocumentKey : keyof IMO_Instance,
		Data : Partial<any>,
		Overwrite = true
	) {
		if ( await this.Init() ) {
			const Document = await DB_Instances.findById( this.MongoDBData?._id );
			if ( Document ) {
				if ( !Overwrite ) {
					for ( const [ Key, Value ] of Object.entries( Data ) ) {
						Document[ SubDocumentKey ][ Key ] = Value;
						Document.markModified( `${ SubDocumentKey }.${ Key }` );
					}
				}
				// Overwrite is faster as the for loop
				else {
					Data._id = Document[ SubDocumentKey ]._id;
					Document[ SubDocumentKey ] = Data;
					Document.markModified( `${ SubDocumentKey }` );
				}

				await Document.save();
				await this.Init();
			}
		}
	}

	async SetPanelConfig( Config : Partial<IPanelServerConfig> ) {
		if ( await this.Init() ) {
			await this.ModifySubDocument( "PanelConfig", Config );
			return this.MongoDBData !== null;
		}
		return true;
	}

	async SetServerState( State : Partial<IInstanceState>, MapData? : any ) {
		if ( await this.Init() ) {
			const NewState : Partial<IInstanceState> = {
				...this.MongoDBData?.State,
				...State
			};

			const NewMap : any = {
				...this.MongoDBData?.ServerMap,
				...MapData
			};

			await this.ModifySubDocument( "State", NewState );
			await this.ModifySubDocument( "ServerMap", NewMap );
			return this.MongoDBData !== null;
		}
		return true;
	}

	async RemoveServer() {
		if ( !( await this.Init() ) ) {
			return;
		}

		const Config = this.GetConfig();
		const State = await this.GetState();

		try {
			await Promise.all( [
				SSHManager.Exec( "kill", [ State.ArkmanagerPID.toString() ] ),
				SSHManager.Exec( "kill", [ State.ArkserverPID.toString() ] )
			] );
			await SSHManager.Exec( "arkmanager", [ "stop", `@${ this.Instance }` ] );

			SSHManager.Exec( "rm", [ "-R", Config.logdir ] )
				.then()
				.catch( () => {
				} );
			SSHManager.Exec( "rm", [ "-R", Config.arkserverroot ] )
				.then()
				.catch( () => {
				} );

			fs.rmSync(
				path.join( __server_arkmanager, "instances", this.Instance + ".cfg" )
			);

			DB_Instances.findByIdAndRemove( this.MongoDBData?._id );
			SystemLib.LogWarning(
				"[SERVER] Server Removed:",
				this.MongoDBData?.Instance
			);
		}
		catch ( e ) {
			SystemLib.LogError( "[SERVER] RemoveServer:", e );
		}
	}

	GetState() : IInstanceState {
		if ( this.IsValid() && this.MongoDBData ) {
			return {
				...DefaultInstanceState(),
				...this.MongoDBData.State
			};
		}
		return DefaultInstanceState();
	}

	GetLogFiles() : Record<string, string> {
		const Logs : Record<string, string> = {};

		let PanelDirPath = path.join( __server_logs, this.Instance );
		if ( fs.existsSync( PanelDirPath ) ) {
			for ( const File of fs.readdirSync( PanelDirPath ) ) {
				const FilePath = path.join( PanelDirPath, File );
				const Stats = fs.statSync( FilePath );
				if ( Stats.isFile() ) {
					Logs[ File ] = FilePath;
				}
			}
		}

		PanelDirPath = path.join(
			__server_dir,
			this.Instance,
			"ShooterGame/Saved/Logs"
		);
		if ( fs.existsSync( PanelDirPath ) ) {
			for ( const File of fs.readdirSync( PanelDirPath ) ) {
				const FilePath = path.join( PanelDirPath, File );
				const Stats = fs.statSync( FilePath );
				if ( Stats.isFile() ) {
					Logs[ File ] = FilePath;
				}
			}
		}

		return Logs;
	}

	GetLogContent( File : string ) : string {
		let Content = "";

		try {
			Content = SystemLib.ClearANSI(
				fs.readFileSync( path.join( File ) ).toString()
			);
		}
		catch ( e ) {
		}

		return Content;
	}

	GetConfigFiles() : Record<string, string> {
		const Logs : Record<string, string> = {
			"Arkmanager.cfg": "Arkmanager.cfg"
		};

		const PanelDirPath = path.join(
			__server_dir,
			this.Instance,
			"ShooterGame/Saved/Config/LinuxServer"
		);
		if ( fs.existsSync( PanelDirPath ) ) {
			for ( const File of fs.readdirSync( PanelDirPath ) ) {
				const FilePath = path.join( PanelDirPath, File );
				const Stats = fs.statSync( FilePath );
				if ( Stats.isFile() ) {
					Logs[ File ] = FilePath;
				}
			}
		}

		return Logs;
	}

	GetConfigContent( File : string ) : Record<string, any> {
		if ( File.toLowerCase().trim() === "arkmanager.cfg" ) {
			return this.GetConfig();
		}

		try {
			return ini.decode( fs.readFileSync( path.join( File ), "utf-8" ).toString() );
		}
		catch ( e ) {
		}

		return {};
	}

	GetConfigContentRaw( File : string ) : string {
		try {
			return fs.readFileSync( path.join( File ), "utf-8" ).toString();
		}
		catch ( e ) {
		}

		return "";
	}

	async SetServerConfig(
		File : string | "arkmanager.cfg",
		Content : any
	) : Promise<boolean> {
		if ( typeof Content === "object" && Object.keys( Content ).length > 0 ) {
			if ( File.toLowerCase() === "arkmanager.cfg" ) {
				fs.writeFileSync( this.InstanceConfigFile, JSONtoConfig( Content ) );
				await this.ModifySubDocument( "ArkmanagerCfg", Content );
				return true;
			}

			const ConfigFile = path.join(
				__server_dir,
				this.Instance,
				"ShooterGame/Saved/Config/LinuxServer",
				File
			);
			if ( fs.existsSync( ConfigFile ) ) {
				fs.writeFileSync( ConfigFile, ini.stringify( Content ) );
			}
		}
		return false;
	}

	public async Update( Data : Partial<IMO_Instance> ) {
		if ( !this.IsValid() ) {
			return;
		}

		for ( const [ Key, Value ] of Object.entries( Data ) ) {
			if ( typeof Value === "object" ) {
				await this.ModifySubDocument( Key as keyof IMO_Instance, Value );
			}
			else {
				await DB_Instances.findByIdAndUpdate( this.MongoDBData!._id, { [ Key ]: Value } );
			}
		}

		this.EmitUpdate();
	}
}
