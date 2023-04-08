import {
	EPerm,
	GetEnumValue,
	TPermissions
}                       from "../Shared/Enum/User.Enum";
import { IMO_Accounts } from "../Types/MongoDB";
import jwt              from "jwt-decode";
import { JwtPayload }   from "jsonwebtoken";

export type JwtSession = IMO_Accounts & JwtPayload;
export default class FrontendUserLib {
	private Token : string;
	private readonly Data : JwtSession;
	private readonly LoggedIn : boolean;

	constructor( Token : string ) {
		this.Token = Token;
		if ( Token !== "" ) {
			try {
				const Decode = jwt<JwtSession>( Token );
				if ( Decode ) {
					this.Data = Decode as JwtSession;
					this.LoggedIn = true;
					return;
				}
			}
			catch ( e ) {
				console.warn( e, Token );
			}
		}
		this.Data = { mail: "", password: "", role: 0, servers: [], username: "" };
		this.LoggedIn = false;
	}

	GetDBInformation() : JwtSession {
		return this.Data;
	}

	public HasPermission( Permission : TPermissions ) : boolean {
		return (
			this.Data?.permissions?.includes( GetEnumValue( EPerm, EPerm.Super ) ) ||
			this.Data?.permissions?.includes( GetEnumValue( EPerm, Permission ) ) ||
			false
		);
	}

	public HasPermissionForServer( ServerName : string ) : boolean {
		return (
			this.Data?.permissions?.includes( GetEnumValue( EPerm, EPerm.Super ) ) ||
			this.Data?.servers?.includes( ServerName ) ||
			false
		);
	}

	IsLoggedIn() {
		if ( this.LoggedIn ) {
			return ( this.Data.exp || 0 ) >= Date.now() / 1000;
		}
		return false;
	}
}
