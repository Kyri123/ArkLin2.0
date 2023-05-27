import type { SSHExecCommandOptions, SSHExecCommandResponse, SSHExecOptions } from "node-ssh";
import { NodeSSH } from "node-ssh";
import { configManager } from "./configManager.Lib";


export class SSHLib {
	private connected = false;
	private sshConnection: NodeSSH = new NodeSSH();

	async init() {
		const config = configManager.getDashboardConfig;
		this.sshConnection.connect( {
			host: config.SSH_Host,
			username: config.SSH_User,
			password: config.SSH_Password,
			privateKeyPath: configManager.getSSHKeyPath
		} )
			.then( () => {
				this.connected = true;
				SystemLib.log( "ssh",
					"Connected to SSH as",
					configManager.getDashboardConfig.SSH_User
				);
			} )
			.catch( e => SystemLib.logFatal( "ssh", "cannot connect to SSH:", e ) );
	}

	getConnection(): NodeSSH {
		return this.sshConnection;
	}

	get isConnected(): boolean {
		return this.connected;
	}

	async exec(
		command: string,
		parameters: string[],
		options?: SSHExecOptions & {
			stream?: "stdout" | "stderr"
		}
	) {
		if( !this.isConnected ) {
			return "ERROR";
		}
		return await this.sshConnection.exec( command, parameters, options );
	}

	async execCommand(
		command: string,
		options?: SSHExecCommandOptions
	): Promise<SSHExecCommandResponse> {
		if( !this.isConnected ) {
			return { code: 0, signal: "", stderr: "", stdout: "" };
		}
		return await this.sshConnection.execCommand( command, options );
	}

	async execCommandInScreen(
		ScreenName: string,
		command: string,
		options?: SSHExecCommandOptions | undefined
	): Promise<SSHExecCommandResponse> {
		return await this.execCommand(
			[ "screen", "-dmS", ScreenName, "bash", "-c", `'${ command }' && exit` ].join(
				" "
			),
			options
		);
	}
}
