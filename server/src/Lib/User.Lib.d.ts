import {
	IMO_Accounts,
	IMO_Instance,
	TMO_Instance
} from "../../../src/Types/MongoDB";
import { If }           from "@kyri123/k-javascript-utils/lib/Types/Conditionals";
import { TPermissions } from "../../../src/Shared/Enum/User.Enum";

export function GetSecretAppToken() : string;

export class UserLib<Ready extends boolean = boolean> {
	private constructor();
	// This is the constructor we want to use a async constructor!
	static async build( JsonWebToken : string | IMO_Instance ) : Promise<UserLib>
	public IsValid() : this is UserLib<true> & boolean;
	public GetDB(): If<Ready, IMO_Accounts>;
	public GetId(): If<Ready, string>;
	public HasPermission( Permission : TPermissions ) : boolean;
	public HasPermissionForServer( ServerName : string ) : boolean;
	public async TogglePermissionForServer( ServerName : string ) : Promise<boolean>;
	public async GetAllServerWithPermission() : Promise< Record<string, TMO_Instance> >;
}