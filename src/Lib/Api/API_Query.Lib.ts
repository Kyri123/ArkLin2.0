import { IAPIRequestBase, IAPIResponseBase } from "../../Types/API";
import { TServerUrls } from "../../Shared/Enum/Routing";

export class API_QueryLib {
  static async PostToAPI<T, D extends IAPIRequestBase = any>(
    Path: TServerUrls,
    Data: D = {} as D
  ): Promise<IAPIResponseBase<T>> {
    const Token = window.localStorage.getItem("AuthToken");
    const requestOptions: RequestInit = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + Token || "",
        "User-Agent": "Frontend",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Data),
    };

    try {
      const Resp: Response | void = await fetch(
        `/api/v1/${Path}`,
        requestOptions
      ).catch((e) => console.log(e));
      if (Resp) {
        if (Resp.ok && Resp.status === 200) {
          const Response = (await Resp.json()) as IAPIResponseBase<T>;
          Response.Reached = true;
          return Response;
        }
      }
    } catch (e) {
      console.log(e);
    }

    return {
      Auth: false,
      Success: false,
      Message: {
        Title: "API konnte nicht erreicht werden!",
        Message:
          "Leider konnte keine verbindung zur API aufgebaut werden... Ist die API offline?",
        AlertType: "danger",
      },
    } as IAPIResponseBase<T>;
  }

  static async GetFromAPI<T, D extends IAPIRequestBase = any>(
    Path: TServerUrls,
    Data: D = {} as D
  ): Promise<IAPIResponseBase<T>> {
    const RequestData: string[] = [];

    if (Data) {
      if (typeof Data === "object" && !Array.isArray(Data)) {
        for (const [Key, Value] of Object.entries(Data)) {
          RequestData.push(`${Key}=${Value}`);
        }
      }
    }

    const Token = window.localStorage.getItem("AuthToken");
    const requestOptions: RequestInit = {
      method: "GET",
      headers: {
        Authorization: "Bearer " + Token || "",
        "User-Agent": "Frontend",
        "Content-Type": "application/json",
      },
    };

    const Resp: Response | void = await fetch(
      `/api/v1/${Path}?${RequestData.join("&")}`,
      requestOptions
    ).catch((e) => console.log(e));
    if (Resp) {
      if (Resp.ok && Resp.status === 200) {
        const Response = (await Resp.json()) as IAPIResponseBase<T>;
        Response.Reached = true;
        return Response;
      }
    }

    return {
      Auth: false,
      Success: false,
      Message: {
        Title: "API konnte nicht erreicht werden!",
        Message:
          "Leider konnte keine verbindung zur API aufgebaut werden... Ist die API offline?",
        AlertType: "danger",
      },
    };
  }
}
