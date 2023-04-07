import { JobTask }                     from "../TaskManager";
import {
	ConfigManager,
	SSHManager
}                                      from "../../Lib/ConfigManager.Lib";
import fs                              from "fs";
import path                            from "path";
import {
	IInstanceData,
	IInstanceState
}                                      from "../../../../src/Shared/Type/ArkSE";
import {
	ConfigToJSON,
	FillWithDefaultValues
}                                      from "../../Lib/Arkmanager.Lib";
import {
	GetOnlinePlayer,
	IsServerOnline
}                                      from "../../Lib/ArkServerQuery.Lib";
import DB_Instances                    from "../../MongoDB/DB_Instances";
import {
	CreateServer,
	ServerLib
}                                      from "../../Lib/Server.Lib";
import { GetDefaultPanelServerConfig } from "../../../../src/Shared/Default/Server.Default";
import { IMO_Instance }                from "../../../../src/Shared/Api/MongoDB";

export default new JobTask(
	ConfigManager.GetTaskConfig.ServerStateInterval,
	"ServerState",
	async() => {
		SystemLib.DebugLog(
			"[TASKS] Running Task",
			SystemLib.ToBashColor( "Red" ),
			"ServerState"
		);

		// Read and save all Instances
		const InstancesFolder = path.join( __server_arkmanager, "instances" );
		const ServerData : Record<string, IInstanceData> = {};
		for ( const Instance of fs.readdirSync( InstancesFolder ) ) {
			if ( Instance.endsWith( ".cfg" ) ) {
				const Server = Instance.replace( ".cfg", "" );
				const FilePath = path.join(
					__server_arkmanager,
					"instances",
					`${ Instance }`
				);
				const ConfigContent = fs.readFileSync( FilePath ).toString();
				const InstanceData = ConfigToJSON( ConfigContent );
				ServerData[ Server ] = FillWithDefaultValues( Server, InstanceData );

				ServerData[ Server ].Instance = Server;
				if ( ( await DB_Instances.exists( { Instance: Server } ) ) !== null ) {
					const ServerL = await ServerLib.build( Server );
					if ( ServerL.IsValid() ) {
						await ServerL.SetServerConfig( "arkmanager.cfg", ServerData[ Server ] );
					}
				}
				else {
					await CreateServer( GetDefaultPanelServerConfig(), Server );
				}
			}
		}

		const EmitData : Record<string, IMO_Instance> = {};
		if ( global.__PublicIP ) {
			const Count = Math.max( Object.keys( ServerData ).length, 1 ) * 2;
			for ( const [ InstanceName, InstanceData ] of Object.entries( ServerData ) ) {
				const ServerL = await ServerLib.build( InstanceName );
				if ( ServerL.IsValid() ) {
					const InstanceState : Partial<IInstanceState> = {
						IsListen: false,
						State: "NotInstalled",
						Player: 0,
						OnlinePlayerList: [],
						ServerVersion: "0.0",
						ArkmanagerPID: 0,
						ArkserverPID: 0
					};

					const VersionFile = path.join(
						__server_dir,
						InstanceName,
						"version.txt"
					);
					const ServerExecFile = path.join(
						__server_dir,
						InstanceName,
						InstanceData.arkserverexec
					);
					const ActionPIDFile = path.join(
						__server_dir,
						InstanceName,
						`.${ InstanceName }.panel.pid`
					);
					const ArkServerPIDFile = path.join(
						__server_dir,
						InstanceName,
						"ShooterGame/Saved",
						`.arkserver-${ InstanceName }.pid`
					);

					const IsInstalled = fs.existsSync( ServerExecFile );

					if ( fs.existsSync( ActionPIDFile ) ) {
						InstanceState.ArkmanagerPID = parseInt(
							fs.readFileSync( ActionPIDFile ).toString()
						);
						if ( InstanceState.ArkmanagerPID !== 0 ) {
							try {
								const Result = await SSHManager.ExecCommand(
									`ps -fp ${ InstanceState.ArkmanagerPID.toString() }`,
									{ encoding: "utf-8" }
								);
								if ( Result.code === 1 ) {
									InstanceState.ArkmanagerPID = 0;
								}
							}
							catch ( e ) {
								InstanceState.ArkmanagerPID = 0;
							}
						}
					}

					if ( IsInstalled ) {
						InstanceState.State = "Offline";
						if ( fs.existsSync( VersionFile ) ) {
							InstanceState.ServerVersion = fs
								.readFileSync( VersionFile )
								.toString()
								.replaceAll( " ", "" )
								.trim();
						}

						if ( fs.existsSync( ArkServerPIDFile ) ) {
							InstanceState.ArkserverPID = parseInt(
								fs.readFileSync( ArkServerPIDFile ).toString()
							);
							if ( InstanceState.ArkserverPID !== 0 ) {
								try {
									const Result = await SSHManager.ExecCommand(
										`ps -fp ${ InstanceState.ArkserverPID.toString() }`,
										{ encoding: "utf-8" }
									);
									if ( Result.code === 1 ) {
										InstanceState.ArkserverPID = 0;
									}
								}
								catch ( e ) {
									InstanceState.ArkserverPID = 0;
								}
							}
						}

						if ( InstanceState.ArkserverPID !== 0 ) {
							InstanceState.IsListen = await IsServerOnline(
								Number( InstanceData.ark_QueryPort ),
								ConfigManager.GetTaskConfig.ServerStateInterval / Count
							);
							InstanceState.State = InstanceState.IsListen
								? "Online"
								: "Running";
							if ( InstanceState.IsListen ) {
								const PlayerList = await GetOnlinePlayer( InstanceName );

								InstanceState.Player = PlayerList.length;
								InstanceState.OnlinePlayerList = PlayerList;
							}
						}
					}

					if ( InstanceState.ArkmanagerPID !== 0 ) {
						InstanceState.State = "ActionInProgress";
					}

					const Icon = `/img/maps/${ ServerL.GetConfig().serverMap }.jpg`;
					const Background = `/img/backgrounds/${
						ServerL.GetConfig().serverMap
					}.jpg`;

					await ServerL.SetServerState( InstanceState, {
						LOGO: fs.existsSync( path.join( __basedir, "public", Icon ) )
							? Icon
							: `/img/maps/TheIsland.jpg`,
						BG: fs.existsSync( path.join( __basedir, "public", Background ) )
							? Background
							: `/img/maps/TheIsland.jpg`
					} );
					EmitData[ ServerL.Instance ] = ServerL.Get!;
				}
			}
		}
		SocketIO.emit( "OnServerUpdated", EmitData );
	}
);
