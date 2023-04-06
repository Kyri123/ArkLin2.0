import {
	EPerm,
	GetEnumValue,
	TPermissions
}                   from "../../../src/Shared/Enum/User.Enum";
import DB_Accounts  from "../MongoDB/DB_Accounts";
import {
	IMO_Accounts,
	IMO_Instance
}                   from "../../../src/Shared/Api/MongoDB";
import DB_Instances from "../MongoDB/DB_Instances";
import * as crypto  from "crypto";
import path         from "path";
import fs           from "fs";
import * as jwt     from "jsonwebtoken";

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

export class UserLib {
	private UserData : IMO_Accounts | null = null;
	private UserID : string | null = null;

	constructor( JsonWebData : IMO_Accounts | string ) {
		if ( typeof JsonWebData === "string" ) {
			this.UserID = JsonWebData;
			return;
		}
		this.UserData = JsonWebData as IMO_Accounts;
	}

	public async Read() : Promise<boolean> {
		if ( this.UserData !== null && this.UserID !== null ) {
			const Query = await DB_Instances.findById(
				this.UserData?._id || this.UserID
			);
			if ( Query ) {
				this.UserData = Query.toJSON();
			}
		}
		return this.IsValid();
	}

	public IsValid() {
		return this.UserData !== null;
	}

	public GetDB() : IMO_Accounts {
		return this.UserData as IMO_Accounts;
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

		if ( this.UserData.servers.Contains( ServerName ) ) {
			this.UserData.servers.RemoveAll( ServerName );
			DB_Accounts.findByIdAndUpdate( this.UserData._id, this.UserData );
			return false;
		}

		this.UserData.servers.AddFirst( ServerName );
		DB_Accounts.findByIdAndUpdate( this.UserData._id, this.UserData );
		return true;
	}

	public async GetAllServerWithPermission() : Promise<
		Record<string, IMO_Instance>
	> {
		const Data : Record<string, IMO_Instance> = {};
		for await ( const Instance of DB_Instances.find( {} ) ) {
			const InstData : IMO_Instance = Instance.toJSON();
			const InstName = InstData.Instance;
			if ( this.HasPermissionForServer( InstName ) ) {
				Data[ InstName ] = InstData;
			}
		}
		return Data;
	}
}
