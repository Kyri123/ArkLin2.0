import { MakeRandomString }         from "@kyri123/k-javascript-utils";
import type {
	ExplIf,
	If
}                                   from "@kyri123/k-javascript-utils/lib/Types/Conditionals";
import fs                           from "fs";
import * as ini                     from "ini";
import path                         from "path";
import type { EArkmanagerCommands } from "@app/Lib/serverUtils";
import {
	DefaultInstanceState,
	GetDefaultPanelServerConfig
}                                   from "@shared/Default/Server.Default";
import { EBashScript }              from "../Enum/EBashScript";
import type { Cluster }             from "@server/MongoDB/DB_Cluster";
import DB_Cluster                   from "@server/MongoDB/DB_Cluster";
import type { Instance }            from "@server/MongoDB/DB_Instances";
import DB_Instances                 from "@server/MongoDB/DB_Instances";
import {
	FillWithDefaultValues,
	GetDefaultInstanceData,
	JSONtoConfig
}                                   from "./Arkmanager.Lib";
import { SSHManager }               from "./ConfigManager.Lib";
import type {
	InstanceData,
	InstanceState,
	PanelServerConfig
}                                   from "@app/Types/ArkSE";

export async function CreateServer(
	PanelConfig : PanelServerConfig,
	InstanceName? : string,
	DefaultConfig? : Partial<InstanceData>
) : Promise<ServerLib<true> | undefined> {
	const InstanceID = InstanceName || MakeRandomString( 20, "-" );
	const ConfigFile = path.join(
		__server_arkmanager,
		"instances",
		InstanceID + ".cfg"
	);

	if ( ( await DB_Instances.exists( { Instance: InstanceID } ) ) === null ) {
		let Config : InstanceData = {
			...GetDefaultInstanceData( InstanceID ),
			...DefaultConfig
		};
		Config = FillWithDefaultValues( InstanceID, Config );
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

		const Lib = await ServerLib.build( InstanceID );
		if ( Lib.IsValid() ) {
			return Lib;
		}
	}

	return undefined;
}

export class ServerLib<Ready extends boolean = boolean> {
	public readonly Instance : string;
	public readonly InstanceConfigFile : string;
	private MongoDBData : ExplIf<Ready, Instance | null, null> = null as ExplIf<Ready, Instance>;
	private cluster : ExplIf<Ready, Cluster | null, undefined> = undefined as ExplIf<Ready, Cluster, undefined>;

	private constructor( ServerInstance : string ) {
		this.Instance = ServerInstance;
		this.InstanceConfigFile = path.join(
			__server_arkmanager,
			"instances",
			`${ this.Instance }.cfg`
		);
	}

	static async build( ServerInstance : string ) : Promise<ServerLib<true>> {
		const Server = new ServerLib( ServerInstance );
		try {
			await Server.Init();
		}
		catch ( e ) {
		}
		return Server;
	}

	get Get() : If<Ready, Instance, undefined> {
		return this.GetWithCluster();
	}

	private async Init() : Promise<boolean> {
		try {
			this.MongoDBData = ( await DB_Instances.findOne( {
				Instance: this.Instance
			} ) )!.toJSON() as ExplIf<Ready, Instance>;

			const Cluster = await DB_Cluster.findOne( { Instances: this.Instance } );
			this.cluster = ( Cluster ? Cluster.toJSON() : null ) as ExplIf<Ready, Cluster, undefined>;
		}
		catch ( e ) {
		}

		return this.IsValid();
	}

	public IsInCluster() : this is ServerLib<true> {
		return this.cluster !== null && this.IsValid();
	}

	/*
	 * @return {Cluster | null} return null if not in a cluster
	 */
	public get GetCluster() : ExplIf<Ready, Cluster | null, undefined> {
		return this.cluster;
	}

	/*
	 * @return {ServerLib | undefined} return undefined if not in a cluster
	 */
	public async GetClusterMaster() : Promise<ServerLib<true> | undefined> {
		if ( !this.IsValid() ) {
			return undefined;
		}

		if ( this.IsMaster ) {
			// we return self if we are the master
			return this;
		}
		else if ( this.IsInCluster() ) {
			const Cluster = this.GetCluster!;
			const MasterServer = await ServerLib.build( Cluster.Master );
			if ( MasterServer.IsValid() ) {
				if ( MasterServer.IsInCluster() && MasterServer.IsMaster ) {
					// we only want to return a init master to we make sure it's the master and it's valid
					return MasterServer;
				}
			}
		}
		return undefined;
	}

	public get IsMaster() : boolean {
		if ( !this.IsValid() ) {
			return false;
		}

		const Cluster = this.GetCluster;
		if ( Cluster ) {
			return Cluster.Master === this.Instance;
		}
		return false;
	}

	public EmitUpdate() {
		if ( this.IsValid() ) {
			SocketIO.emit( "OnServerUpdated", { [ this.Instance ]: this.GetWithCluster() as Instance } );
		}
	}

	public GetWithCluster() : If<Ready, Instance, undefined> {
		if ( this.IsValid() ) {
			return ( {
				...this.MongoDBData,
				Cluster: this.GetCluster
			} as Instance ) as If<Ready, Instance, undefined>;
		}
		return undefined as If<Ready, Instance, undefined>;
	}

	public IsValid() : this is ServerLib<true> {
		return fs.existsSync( this.InstanceConfigFile ) && this.MongoDBData !== null;
	}

	GetConfig() : InstanceData {
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
			Params.addAtIndex( "--dots" );
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

			SystemLib.Log( "CMD", "Executing:", `'${ EBashScript.arkmanger } "arkmanager ${ Command } ${ Params.join( " " ) }" "${ this.Instance }"'` );
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

	GetPanelConfig() : PanelServerConfig {
		if ( this.IsValid() && this.MongoDBData ) {
			return {
				...GetDefaultPanelServerConfig(),
				...this.MongoDBData.PanelConfig
			};
		}
		return GetDefaultPanelServerConfig();
	}

	async ModifySubDocument(
		SubDocumentKey : keyof Instance,
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
					// @ts-ignore
					Document[ SubDocumentKey ] = Data;
					Document.markModified( `${ SubDocumentKey }` );
				}

				await Document.save();
				await this.Init();
			}
		}
	}

	async SetPanelConfig( Config : Partial<PanelServerConfig> ) {
		if ( await this.Init() ) {
			await this.ModifySubDocument( "PanelConfig", Config );
			return this.MongoDBData !== null;
		}
		return true;
	}

	async SeEServerState( State : Partial<InstanceState>, MapData? : any ) {
		if ( await this.Init() ) {
			const NewState : Partial<InstanceState> = {
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
				"SERVER", "Server Removed:",
				this.MongoDBData?.Instance
			);

			SocketIO.emit( "OnServerRemoved" );
		}
		catch ( e ) {
			SystemLib.LogError( "SERVER", "RemoveServer:", e );
		}
	}

	GetState() : InstanceState {
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

	SetServerConfigRaw(
		File : string | "arkmanager.cfg",
		Content : string
	) : boolean {
		try {
			if ( File !== "arkmanager.cfg" ) {

				const ConfigFile = path.join(
					__server_dir,
					this.Instance,
					"ShooterGame/Saved/Config/LinuxServer",
					File
				);

				fs.writeFileSync( ConfigFile, Content );
				return true;
			}
		}
		catch ( e ) {
		}

		return false;
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
				return true;
			}
		}
		return false;
	}

	public async Update( Data : Partial<Instance> ) {
		if ( !this.IsValid() ) {
			return;
		}

		for ( const [ Key, Value ] of Object.entries( Data ) ) {
			if ( typeof Value === "object" ) {
				await this.ModifySubDocument( Key as keyof Instance, Value );
			}
			else {
				await DB_Instances.findByIdAndUpdate( this.MongoDBData!._id, { [ Key ]: Value } );
			}
		}

		this.EmitUpdate();
	}
}