import type {
	TPermissions
} from "../../../src/Shared/Enum/User.Enum";
import {
	EPerm,
	GetEnumValue
}                    from "../../../src/Shared/Enum/User.Enum";
import DB_Accounts   from "../MongoDB/DB_Accounts";
import type {
	IMO_Accounts,
	IMO_Instance,
	TMO_Instance
}                    from "../../../src/Types/MongoDB";
import DB_Instances  from "../MongoDB/DB_Instances";
import * as crypto   from "crypto";
import path          from "path";
import fs            from "fs";
import * as jwt      from "jsonwebtoken";
import { ServerLib } from "./Server.Lib";
import type { If }        from "@kyri123/k-javascript-utils/lib/Types/Conditionals";

export function GetSecretAppToken() : string {
	if ( global.__AppToken && typeof __AppToken === "string" ) {
		return __AppToken;
	}

	let Token = crypto.randomBytes( 64 ).toString( "hex" );
	const TokenFile = path.join( __configdir, "app.token" );
	if ( fs.existsSync( TokenFile ) ) {
		Token = fs.readFileSync( TokenFile ).toString().trim();
	}
	else {
		fs.writeFileSync( TokenFile, Token );
	}
	global.__AppToken = Token;
	return __AppToken as string;
}

export function GenerateAccessToken( UserData : IMO_Accounts, ExpireInDays = 1 ) {
	return jwt.sign( UserData, GetSecretAppToken(), {
		expiresIn: `${ ExpireInDays * 24 * 60 * 60 }s`
	} );
}

export class UserLib<Ready extends boolean = boolean> {
	private UserData : If<Ready, IMO_Accounts> = null as If<Ready, IMO_Accounts>;
	private UserID : If<Ready, string> = null as If<Ready, string>;

	private constructor() {
	}

	static async build( JsonWebToken : string | IMO_Instance ) {
		const User = new UserLib();
		try {
			const UserData = await DB_Accounts.findOne( { _id: ( JsonWebToken as IMO_Instance )._id || JsonWebToken } );
			if ( UserData ) {
				User.UserID = UserData._id;
				User.UserData = UserData.toJSON();
			}
		}
		catch ( e ) {
		}
		return User;
	}

	public IsValid() : this is UserLib<true> {
		return this.UserData !== null;
	}

	public GetDB() {
		return this.UserData;
	}

	public GetId() {
		return this.UserID;
	}

	public HasPermission( Permission : TPermissions ) : boolean {
		return (
			this.UserData?.permissions?.includes( GetEnumValue( EPerm, EPerm.Super ) ) ||
			this.UserData?.permissions?.includes( GetEnumValue( EPerm, Permission ) ) ||
			false
		);
	}

	public HasPermissionForServer( ServerName : string ) : boolean {
		return (
			this.UserData?.permissions?.includes( GetEnumValue( EPerm, EPerm.Super ) ) ||
			this.UserData?.servers?.includes( ServerName ) ||
			false
		);
	}

	/**
	 *  @return true if added, false if removed
	 *  */
	public async TogglePermissionForServer( ServerName : string ) : Promise<boolean> {
		if ( this.UserData === null ) {
			return false;
		}

		if ( this.UserData.servers.includes( ServerName ) ) {
			this.UserData.servers.rm( ServerName, true );
			DB_Accounts.findByIdAndUpdate( this.UserData._id, this.UserData );
			return false;
		}

		this.UserData.servers.addAtIndex( ServerName );
		DB_Accounts.findByIdAndUpdate( this.UserData._id, this.UserData );
		return true;
	}

	public async GetAllServerWithPermission() : Promise<
		Record<string, TMO_Instance>
	> {
		const Data : Record<string, TMO_Instance> = {};
		for await ( const Instance of DB_Instances.find( {} ) ) {
			if ( this.HasPermissionForServer( Instance.Instance ) ) {
				const Server = await ServerLib.build( Instance.Instance );
				if ( Server.IsValid() ) {
					Data[ Server.Instance ] = Server.GetWithCluster();
				}
			}
		}
		return Data;
	}
}
