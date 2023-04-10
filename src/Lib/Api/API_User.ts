import { API_QueryLib } from "./API_Query.Lib";
import {
	TResponse_User_Addkey,
	TResponse_User_Allkeys,
	TResponse_User_Alluser,
	TResponse_User_Edituser,
	TResponse_User_Getallowedservers,
	TResponse_User_Removeaccount,
	TResponse_User_Removekey,
	TResponse_User_Usereditaccount
}                       from "../../Shared/Type/API_Response";
import {
	IMO_AccountKeys,
	IMO_Accounts,
	TMO_Instance
}                       from "../../Types/MongoDB";
import { EUserUrl }     from "../../Shared/Enum/Routing";

export class API_User {
	static async UserSettings_EditAccount(
		UserData : IMO_Accounts,
		PasswordInput : string[]
	) : Promise<TResponse_User_Usereditaccount> {
		return await API_QueryLib.PostToAPI<TResponse_User_Usereditaccount>(
			EUserUrl.usereditaccount,
			{
				UserData: UserData,
				Passwd: PasswordInput
			}
		);
	}

	static async GetAllowedServer(
		UserID : string
	) : Promise<Record<string, TMO_Instance>> {
		const Data = await API_QueryLib.PostToAPI<TResponse_User_Getallowedservers>(
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

	static async EditUser( UserID : string, Data : Partial<IMO_Accounts> ) : Promise<TResponse_User_Edituser> {
		return await API_QueryLib.PostToAPI<TResponse_User_Edituser>( EUserUrl.edituser, {
			UserID: UserID,
			User: Data
		} );
	}

	static async GetAllUsers( Default : IMO_Accounts ) : Promise<IMO_Accounts[]> {
		const Data = await API_QueryLib.GetFromAPI<TResponse_User_Alluser>(
			EUserUrl.alluser
		);
		if ( Data.Data && Array.isArray( Data.Data ) ) {
			return Data.Data;
		}
		return [ Default ];
	}

	static async GetAllKeys() : Promise<IMO_AccountKeys[]> {
		const Data = await API_QueryLib.GetFromAPI<TResponse_User_Allkeys>(
			EUserUrl.allkeys
		);
		if ( Data.Data && Array.isArray( Data.Data ) ) {
			return Data.Data;
		}
		return [];
	}

	static async RemoveAccount( Id : string ) : Promise<TResponse_User_Removeaccount> {
		return await API_QueryLib.PostToAPI<TResponse_User_Removeaccount>( EUserUrl.removeaccount, {
			Id: Id
		} );
	}

	static async RemoveKey( Id : string ) : Promise<TResponse_User_Removekey> {
		return await API_QueryLib.PostToAPI<TResponse_User_Removekey>( EUserUrl.removekey, {
			Id: Id
		} );
	}

	static async AddKey( SuperAdmin : boolean ) : Promise<TResponse_User_Addkey> {
		return await API_QueryLib.PostToAPI<TResponse_User_Addkey>( EUserUrl.addkey, {
			rang: SuperAdmin ? 1 : 0
		} );
	}
}
