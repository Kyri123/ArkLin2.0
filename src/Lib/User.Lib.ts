import type { TPermissions }      from "@shared/Enum/User.Enum";
import {
	EPerm,
	GetEnumValue
}                                 from "@shared/Enum/User.Enum";
import jwt                        from "jwt-decode";
import type { ClientUserAccount } from "@server/MongoDB/DB_Accounts";

export default class User {
	private Token : string;
	private readonly Data : ClientUserAccount;
	private readonly LoggedIn : boolean;

	constructor( Token : string ) {
		this.Token = Token;
		if ( Token !== "" ) {
			try {
				const Decode = jwt<ClientUserAccount>( Token );
				if ( Decode ) {
					this.Data = Decode as ClientUserAccount;
					this.LoggedIn = true;
					return;
				}
			}
			catch ( e ) {
				console.error( e, Token );
			}
		}
		this.Data = { _id: "", created_at: "", permissions: [], updated_at: "", mail: "", servers: [], username: "" };
		this.LoggedIn = false;
	}

	GetDBInformation() : ClientUserAccount {
		return this.Data;
	}

	get Get() : ClientUserAccount {
		return this.Data;
	}

	public HasPermission( Permission : TPermissions ) : boolean {
		return (
			this.Data?.permissions?.includes( GetEnumValue( EPerm.Super ) ) ||
			this.Data?.permissions?.includes( GetEnumValue( Permission ) )
		);
	}

	public HasPermissionForServer( ServerName : string ) : boolean {
		return (
			this.Data?.permissions?.includes( GetEnumValue( EPerm.Super ) ) ||
			this.Data?.servers?.includes( ServerName )
		);
	}

	IsLoggedIn() {
		if ( this.LoggedIn ) {
			return ( this.Data.exp || 0 ) >= Date.now() / 1000;
		}
		return false;
	}
}
