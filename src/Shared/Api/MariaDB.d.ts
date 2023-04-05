import { IMongoDB } from "./MongoDB";

export interface IMO_AccountKeys extends IMongoDB {
  key: string;
  AsSuperAdmin: boolean;
}

export interface IMO_SteamAPI extends IMongoDB {
  modid: number;
  data: Record<string, any>;
}
