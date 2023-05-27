import { EArkmanagerCommands } from "@app/Lib/serverUtils";
import type {
	InstanceData,
	InstanceState,
	PanelServerConfig
} from "@app/Types/ArkSE";
import { MakeRandomString } from "@kyri123/k-javascript-utils";
import type { Cluster } from "@server/MongoDB/MongoCluster";
import MongoCluster from "@server/MongoDB/MongoCluster";
import type { Instance } from "@server/MongoDB/MongoInstances";
import MongoInstances from "@server/MongoDB/MongoInstances";
import {
	defaultInstanceState,
	getDefaultPanelServerConfig
} from "@shared/Default/Server.Default";
import fs from "fs";
import { rm } from "fs/promises";
import * as ini from "ini";
import type { HydratedDocument } from "mongoose";
import path from "path";
import { EBashScript } from "../Enum/EBashScript";
import {
	fillWithDefaultValues,
	getDefaultInstanceData,
	jsonToConfig
} from "./arkmanager.Lib";
import { sshManager } from "./configManager.Lib";


export async function createServer(
	PanelConfig: PanelServerConfig,
	InstanceName?: string,
	DefaultConfig?: Partial<InstanceData>
): Promise<ServerLib | undefined> {
	const instanceId = InstanceName || MakeRandomString( 20, "-" );
	const configFile = path.join(
		SERVERARKMANAGER,
		"instances",
		instanceId + ".cfg"
	);

	if( ( await MongoInstances.exists( { Instance: instanceId } ) ) === null ) {
		let config: InstanceData = {
			...getDefaultInstanceData( instanceId ),
			...DefaultConfig
		};
		config = fillWithDefaultValues( instanceId, config );
		fs.writeFileSync( configFile, jsonToConfig( config ) );
		await MongoInstances.create( {
			Instance: instanceId,
			ArkmanagerCfg: config,
			State: defaultInstanceState(),
			PanelConfig: PanelConfig,
			ServerMap: {
				BG: `/img/maps/TheIsland.jpg`,
				LOGO: `/img/maps/TheIsland.jpg`
			}
		} );

		const lib = await ServerLib.build( instanceId );
		if( lib.isValid() ) {
			return lib;
		}
	}

	return undefined;
}

export class ServerLib {
	public readonly instanceId: string;
	public readonly instanceConfigFile: string;
	private mongoDocument: HydratedDocument<Instance> | null = null;
	private cluster: HydratedDocument<Cluster> | null = null;

	private constructor( ServerInstance: string ) {
		this.instanceId = ServerInstance;
		this.instanceConfigFile = path.join(
			SERVERARKMANAGER,
			"instances",
			`${ this.instanceId }.cfg`
		);
	}

	static async build( ServerInstance: string ): Promise<ServerLib> {
		const server = new ServerLib( ServerInstance );
		try {
			await server.init();
		} catch( e ) {
			if( e instanceof Error ) {
				SystemLib.debugLog( "server", e.message );
			}
		}
		return server;
	}

	get get() {
		return this.getWithCluster()!;
	}

	private async init(): Promise<boolean> {
		try {
			this.mongoDocument = await MongoInstances.findOne( {
				Instance: this.instanceId
			} ).populate( "cluster" );

			if( ( this.mongoDocument?.cluster?._id?.length ?? 0 ) > 0 ) {
				this.cluster = await MongoCluster.findById( this.mongoDocument!.cluster!._id! );
			}
		} catch( e ) {
			if( e instanceof Error ) {
				SystemLib.debugLog( "server", e.message );
			}
		}

		return this.isValid();
	}

	public async refresh(): Promise<boolean> {
		return await this.init();
	}

	public async wipe(): Promise<boolean> {
		try {
			await this.executeCommand( EArkmanagerCommands.stop, [ "--force" ] );
			fs.rmSync( path.join( SERVERDIR, this.instanceId, "/ShooterGame/Saved/SavedArks" ), {
				recursive: true,
				force: true
			} );
		} catch( e ) {
			if( e instanceof Error ) {
				SystemLib.debugLog( "server", e.message );
			}
		}

		return false;
	}

	public isInCluster() {
		return !!this.cluster && this.isValid();
	}

	/*
	 * @return {Cluster | null} return null if not in a cluster
	 */
	public get getCluster() {
		return this.cluster!;
	}

	/*
	 * @return {ServerLib | undefined} return undefined if not in a cluster
	 */
	public async getClusterMaster(): Promise<ServerLib | undefined> {
		if( !this.isValid() ) {
			return undefined;
		}

		if( this.isMaster ) {
			// we return self if we are the master
			return this;
		} else if( this.isInCluster() ) {
			const cluster = this.getCluster;
			const masterServer = await ServerLib.build( cluster.Master.toString() );
			if( masterServer.isValid() ) {
				if( masterServer.isInCluster() && masterServer.isMaster ) {
					// we only want to return a init master to we make sure it's the master and it's valid
					return masterServer;
				}
			}
		}
		return undefined;
	}

	public get isMaster(): boolean {
		if( !this.isValid() ) {
			return false;
		}

		if( this.getCluster ) {
			return this.getCluster.Master.toString() === this.instanceId;
		}
		return false;
	}

	public emitUpdate() {
		if( this.isValid() ) {
			SocketIO.emit( "onServerUpdated", { [ this.instanceId ]: this.getWithCluster() as Instance } );
		}
	}

	public getWithCluster(): Instance {
		return ( {
			...this.mongoDocument,
			cluster: this.getCluster
		} as Instance );
	}

	public isValid(): boolean {
		return fs.existsSync( this.instanceConfigFile ) && this.mongoDocument !== null;
	}

	getConfig(): InstanceData {
		if( !this.isValid() ) {
			return getDefaultInstanceData( this.instanceId );
		}
		return this.mongoDocument?.ArkmanagerCfg!;
	}

	async getDb(): Promise<HydratedDocument<Instance> | null> {
		await this.refresh();
		return this.mongoDocument;
	}

	async executeCommand(
		Command: EArkmanagerCommands,
		Params: string[] = []
	): Promise<boolean> {
		const state = await this.getState();
		if( state.ArkmanagerPID === 0 ) {
			Params.addAtIndex( "--dots" );
			fs.mkdirSync( path.join( SERVERDIR, this.instanceId ), { recursive: true } );
			fs.mkdirSync( path.join( SERVERLOGSDIR, this.instanceId ), {
				recursive: true
			} );
			fs.mkdirSync( path.join( SERVERBACKUPDIR, this.instanceId ), {
				recursive: true
			} );

			await this.modifySubDocument( "State", {
				...this.mongoDocument!.State,
				State: "ActionInProgress",
				ArkmanagerPID: 1
			} );

			SystemLib.log( "CMD", "Executing:", `'${ EBashScript.arkmanger } "arkmanager ${ Command } ${ Params.join( " " ) }" "${ this.instanceId }"'` );
			sshManager.execCommand(
				[
					`${ EBashScript.arkmanger } "arkmanager ${ Command } ${ Params.join( " " ) }" "${ this.instanceId }"`
				].join( " " )
			).then( () => {
			} );
			this.emitUpdate();
			return true;
			/*sshManager.execCommand( [ "screen", '-dmS', this.instanceId, 'bash', '-c', `'${ path.join( process.env.APPEND_BASEDIR, BASEDIR, "sh/arkmanager.sh" ) } "arkmanager ${ Command } ${ Params.join( " " ) }" "${ this.instanceId }"'` ].join( " " ) ).then( () => {} );
			 return true;*/
		}
		return false;
	}

	getPanelConfig(): PanelServerConfig {
		if( this.isValid() && this.mongoDocument ) {
			return {
				...getDefaultPanelServerConfig(),
				...this.mongoDocument.PanelConfig
			};
		}
		return getDefaultPanelServerConfig();
	}

	async modifySubDocument(
		subDocumentKey: keyof Instance,
		Data: Partial<any>,
		Overwrite = true
	) {
		if( await this.init() ) {
			const doc = await MongoInstances.findById( this.mongoDocument?._id );
			if( doc ) {
				if( !Overwrite ) {
					for( const [ key, value ] of Object.entries( Data ) ) {
						doc[ subDocumentKey ][ key ] = value;
						doc.markModified( `${ subDocumentKey }.${ key }` );
					}
				}

				// Overwrite is faster as the for loop
				else {
					Data._id = doc[ subDocumentKey ]._id;
					// @ts-ignore
					doc[ subDocumentKey ] = Data;
					doc.markModified( `${ subDocumentKey }` );
				}

				if( await doc.save() ) {
					const data = await this.getDb();
					if( data ) {
						SocketIO.emit( "onServerUpdated", { [ this.instanceId ]: data.toJSON() } );
					}
				}
				await this.init();
			}
		}
	}

	async setPanelConfig( Config: Partial<PanelServerConfig> ) {
		if( await this.init() ) {
			await this.modifySubDocument( "PanelConfig", Config );
			return this.mongoDocument !== null;
		}
		return true;
	}

	async setServerState( State: Partial<InstanceState>, MapData?: any ) {
		if( await this.init() ) {
			const newState: Partial<InstanceState> = {
				...this.mongoDocument?.State,
				...State
			};

			const newMap: any = {
				...this.mongoDocument?.ServerMap,
				...MapData
			};

			await this.modifySubDocument( "State", newState );
			await this.modifySubDocument( "ServerMap", newMap );

			return this.mongoDocument !== null;
		}
		return true;
	}

	async removeServer() {
		if( !( await this.init() ) ) {
			return;
		}

		const config = this.getConfig();
		const state = await this.getState();

		try {
			await Promise.all( [
				sshManager.exec( "kill", [ state.ArkmanagerPID.toString() ] ).catch( () => {
				} ),
				sshManager.exec( "kill", [ state.ArkserverPID.toString() ] ).catch( () => {
				} ),
				sshManager.exec( "arkmanager", [ "stop", `@${ this.instanceId }` ] ).catch( () => {
				} )
			] );

			await Promise.all( [
				sshManager.exec( "rm", [ "-R", config.logdir ] ).catch( () => {
				} ),
				sshManager.exec( "rm", [ "-R", config.arkserverroot ] ).catch( () => {
				} ),
				rm( path.join( SERVERARKMANAGER, "instances", this.instanceId + ".cfg" ) ).catch( () => {
				} ),
				MongoInstances.findByIdAndRemove( this.mongoDocument?._id )
			] );

			SystemLib.logWarning(
				"SERVER", "Server Removed:",
				this.mongoDocument?.Instance
			);

			SocketIO.emit( "onServerRemoved" );
		} catch( e ) {
			SystemLib.logError( "SERVER", "removeServer:", e );
		}
	}

	getState(): InstanceState {
		if( this.isValid() && this.mongoDocument ) {
			return {
				...defaultInstanceState(),
				...this.mongoDocument.State
			};
		}
		return defaultInstanceState();
	}

	getLogFiles(): Record<string, string> {
		const logs: Record<string, string> = {};

		let panelDirPath = path.join( SERVERLOGSDIR, this.instanceId );
		if( fs.existsSync( panelDirPath ) ) {
			for( const file of fs.readdirSync( panelDirPath ) ) {
				const filePath = path.join( panelDirPath, file );
				const stats = fs.statSync( filePath );
				if( stats.isFile() ) {
					logs[ file ] = filePath;
				}
			}
		}

		panelDirPath = path.join(
			SERVERDIR,
			this.instanceId,
			"ShooterGame/Saved/Logs"
		);
		if( fs.existsSync( panelDirPath ) ) {
			for( const file of fs.readdirSync( panelDirPath ) ) {
				const filePath = path.join( panelDirPath, file );
				const stats = fs.statSync( filePath );
				if( stats.isFile() ) {
					logs[ file ] = filePath;
				}
			}
		}

		return logs;
	}

	getLogContent( File: string ): string {
		let content = "";

		try {
			content = SystemLib.clearANSI(
				fs.readFileSync( path.join( File ) ).toString()
			);
		} catch( e ) {
			if( e instanceof Error ) {
				SystemLib.logError( "SERVER", "getLogContent:", e.message );
			}
		}

		return content;
	}

	getConfigFiles(): Record<string, string> {
		const logs: Record<string, string> = {
			"Arkmanager.cfg": "Arkmanager.cfg"
		};

		const panelDirPath = path.join(
			SERVERDIR,
			this.instanceId,
			"ShooterGame/Saved/Config/LinuxServer"
		);
		if( fs.existsSync( panelDirPath ) ) {
			for( const file of fs.readdirSync( panelDirPath ) ) {
				const filePath = path.join( panelDirPath, file );
				const stats = fs.statSync( filePath );
				if( stats.isFile() ) {
					logs[ file ] = filePath;
				}
			}
		}

		return logs;
	}

	getConfigContent( File: string ): Record<string, any> {
		if( File.toLowerCase().trim() === "arkmanager.cfg" ) {
			return this.getConfig();
		}

		try {
			return ini.decode( fs.readFileSync( path.join( File ), "utf-8" ).toString() );
		} catch( e ) {
		}

		return {};
	}

	getConfigContentRaw( File: string | "arkmanager.cfg" ): string {
		try {
			if( !File.startsWith( BASEDIR ) || File.toLowerCase().trim() === "arkmanager.cfg" ) {
				throw new Error( "File not found" );
			}
			return fs.readFileSync( path.join( File ), "utf-8" );
		} catch( e ) {
			try {
				if( File.toLowerCase().trim() === "arkmanager.cfg" ) {
					return fs.readFileSync( this.instanceConfigFile, "utf-8" );
				}
			} catch( e ) {
			}
		}

		return "";
	}

	setServerConfigRaw(
		File: string | "arkmanager.cfg",
		Content: string
	): boolean {
		// make sure we have only a filename not a path!
		File = File.split( "/" ).at( -1 )!;
		try {
			if( File.toLowerCase().trim() === "arkmanager.cfg" ) {
				throw new Error( "File not found" );
			}
			if( File.toLowerCase().trim() !== "arkmanager.cfg" ) {

				const configFile = path.join(
					SERVERDIR,
					this.instanceId,
					"ShooterGame/Saved/Config/LinuxServer",
					File
				);

				SystemLib.debugLog( "Filewrite", "Saved Config:", configFile );
				fs.writeFileSync( configFile, Content );
				return true;
			} else {
			}
		} catch( e ) {
			try {
				SystemLib.debugLog( "Filewrite", "Saved Config:", this.instanceConfigFile );
				fs.writeFileSync( this.instanceConfigFile, Content );
				return true;
			} catch( e ) {
			}
		}

		return false;
	}

	async setServerConfig(
		File: string | "arkmanager.cfg",
		Content: any
	): Promise<boolean> {
		if( typeof Content === "object" && Object.keys( Content ).length > 0 ) {
			if( File.toLowerCase() === "arkmanager.cfg" ) {
				fs.writeFileSync( this.instanceConfigFile, jsonToConfig( Content ) );
				await this.modifySubDocument( "ArkmanagerCfg", Content );
				return true;
			}

			const configFile = path.join(
				SERVERDIR,
				this.instanceId,
				"ShooterGame/Saved/Config/LinuxServer",
				File
			);

			if( fs.existsSync( configFile ) ) {
				fs.writeFileSync( configFile, ini.stringify( Content ) );
				return true;
			}
		}
		return false;
	}

	public async update( Data: Partial<Instance> ) {
		if( !this.isValid() ) {
			return;
		}

		for( const [ key, value ] of Object.entries( Data ) ) {
			if( typeof value === "object" ) {
				await this.modifySubDocument( key as keyof Instance, value );
			} else {
				await MongoInstances.findByIdAndUpdate( this.mongoDocument!._id, { [ key ]: value } );
			}
		}

		this.emitUpdate();
	}
}
