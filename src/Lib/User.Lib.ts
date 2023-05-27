import type { ClientUserAccount } from "@server/MongoDB/MongoAccounts";
import type { TPermissions } from "@shared/Enum/User.Enum";
import {
	EPerm,
	GetEnumValue
} from "@shared/Enum/User.Enum";
import jwt from "jwt-decode";


export default class User {
	private token: string;
	private readonly data: ClientUserAccount;
	private readonly loggedIn: boolean;

	constructor( Token: string ) {
		this.token = Token;
		if( Token !== "" ) {
			try {
				const decode = jwt<ClientUserAccount>( Token );
				if( decode ) {
					this.data = decode as ClientUserAccount;
					this.loggedIn = true;
					return;
				}
			} catch( e ) {
				console.error( e, Token );
			}
		}
		this.data = { _id: "", created_at: "", permissions: [], updated_at: "", mail: "", servers: [], username: "" };
		this.loggedIn = false;
	}

	get get(): ClientUserAccount {
		return this.data;
	}

	public hasPermission( Permission: TPermissions ): boolean {
		return (
			this.data?.permissions?.includes( GetEnumValue( EPerm.Super ) ) ||
			this.data?.permissions?.includes( GetEnumValue( Permission ) )
		);
	}

	public hasPermissionForServer( ServerName: string ): boolean {
		return (
			this.data?.permissions?.includes( GetEnumValue( EPerm.Super ) ) ||
			this.data?.servers?.includes( ServerName )
		);
	}
}
