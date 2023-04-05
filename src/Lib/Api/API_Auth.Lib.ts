import { API_QueryLib } from "./API_Query.Lib";
import { ISignInRequest, ISignUpRequest } from "../../Shared/Api/Auth.Request";
import { IAPIResponseBase } from "../../Types/API";
import { IAccountInformations } from "../../Shared/Type/User";
import { EAuthUrl } from "../../Shared/Enum/Routing";

export class API_AuthLib {
  static async IsLoggedIn(): Promise<IAPIResponseBase<IAccountInformations>> {
    return await API_QueryLib.PostToAPI<IAccountInformations>(
      EAuthUrl.check,
      {}
    );
  }

  static async TryCreateAnAccount(
    RequestData: ISignUpRequest
  ): Promise<IAPIResponseBase<IAccountInformations>> {
    return await API_QueryLib.PostToAPI<IAccountInformations>(
      EAuthUrl.signup,
      RequestData
    );
  }

  static async DoLogin(
    RequestData: ISignInRequest
  ): Promise<IAPIResponseBase<IAccountInformations>> {
    return await API_QueryLib.PostToAPI<IAccountInformations>(
      EAuthUrl.signin,
      RequestData
    );
  }
}
