import { API_QueryLib }     from "./API_Query.Lib";
import { IMO_AccountKeys }  from "../../Shared/Api/MariaDB";
import { IAPIResponseBase } from "../../Shared/Type/API_Response";
import { IInstanceData }    from "../../Shared/Type/ArkSE";
import { IMO_Accounts }     from "../../Shared/Api/MongoDB";
import { EUserUrl }         from "../../Shared/Enum/Routing";

export class API_User {
	static async UserSettings_EditAccount(
		UserData : IMO_Accounts,
		PasswordInput : string[]
	) : Promise<IAPIResponseBase> {
		return await API_QueryLib.PostToAPI<Record<string, IInstanceData>>(
			EUserUrl.usereditaccount,
			{
				UserData: UserData,
				Passwd: PasswordInput
			}
		);
	}

	static async GetAllowedServer(
		UserID : string
	) : Promise<Record<string, IInstanceData>> {
		const Data = await API_QueryLib.PostToAPI<Record<string, IInstanceData>>(
			EUserUrl.getallowedservers,
			{
				Id: UserID
			}
		);
		if ( Data.Data ) {
			return Data.Data;
		}
		return {};
	}

	static async EditUser( UserID : string, Data : Partial<IMO_Accounts> ) {
		return await API_QueryLib.PostToAPI<any>( EUserUrl.edituser, {
			UserID: UserID,
			User: Data
		} );
	}

	static async GetAllUsers( Default : IMO_Accounts ) : Promise<IMO_Accounts[]> {
		const Data = await API_QueryLib.GetFromAPI<IMO_Accounts[]>(
			EUserUrl.alluser
		);
		if ( Data.Data && Array.isArray( Data.Data ) ) {
			return Data.Data;
		}
		return [ Default ];
	}

	static async GetAllKeys() : Promise<IMO_AccountKeys[]> {
		const Data = await API_QueryLib.GetFromAPI<IMO_AccountKeys[]>(
			EUserUrl.allkeys
		);
		if ( Data.Data && Array.isArray( Data.Data ) ) {
			return Data.Data;
		}
		return [];
	}

	static async RemoveAccount( Id : string ) : Promise<IAPIResponseBase> {
		return await API_QueryLib.PostToAPI<any>( EUserUrl.removeaccount, {
			Id: Id
		} );
	}

	static async RemoveKey( Id : string ) : Promise<IAPIResponseBase> {
		return await API_QueryLib.PostToAPI<any>( EUserUrl.removekey, {
			Id: Id
		} );
	}

	static async AddKey( SuperAdmin : boolean ) : Promise<IAPIResponseBase> {
		return await API_QueryLib.PostToAPI<any>( EUserUrl.addkey, {
			rang: SuperAdmin ? 1 : 0
		} );
	}
}
