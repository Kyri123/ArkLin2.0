import type {
	SSHExecCommandOptions,
	SSHExecCommandResponse,
	SSHExecOptions
}                        from "node-ssh";
import { NodeSSH }       from "node-ssh";
import { ConfigManager } from "./ConfigManager.Lib";

export class SSHLib {
	private CrashCount = 0;
	private HasInit = false;
	private SSHConnection : NodeSSH = new NodeSSH();

	async Init() {
		const Config = ConfigManager.GetDashboardConifg;
		this.SSHConnection.connect( {
			host: Config.SSH_Host,
			username: Config.SSH_User,
			password: Config.SSH_Password,
			privateKeyPath: ConfigManager.GetSSHKeyPath
		} )
			.then( () => {
				this.HasInit = true;
				SystemLib.Log( "ssh",
					"Connected to SSH as",
					ConfigManager.GetDashboardConifg.SSH_User
				);
			} )
			.catch( ( e ) => SystemLib.LogFatal( "ssh", "cannot connect to SSH:", e ) );
	}

	GetConnection() : NodeSSH {
		return this.SSHConnection;
	}

	async Exec(
		command : string,
		parameters : string[],
		options? : SSHExecOptions & {
			stream? : "stdout" | "stderr";
		}
	) {
		if ( !this.HasInit ) {
			return "ERROR";
		}
		return await this.SSHConnection.exec( command, parameters, options ).catch(
			( e ) => {
				this.CrashCount++;
				if ( this.CrashCount >= 10 ) {
					SystemLib.LogFatal( `SSH", "Error ${ this.CrashCount } / 10:`, e );
				}
				else {
					SystemLib.LogError( `SSH", "Error ${ this.CrashCount } / 10:`, e );
				}
			}
		);
	}

	async ExecCommand(
		command : string,
		options? : SSHExecCommandOptions
	) : Promise<SSHExecCommandResponse> {
		if ( !this.HasInit ) {
			return { code: 0, signal: "", stderr: "", stdout: "" };
		}
		return await this.SSHConnection.execCommand( command, options );
	}

	async ExecCommandInScreen(
		ScreenName : string,
		command : string,
		options? : SSHExecCommandOptions | undefined
	) : Promise<SSHExecCommandResponse> {
		return await this.ExecCommand(
			[ "screen", "-dmS", ScreenName, "bash", "-c", `'${ command }' && exit` ].join(
				" "
			),
			options
		);
	}
}
