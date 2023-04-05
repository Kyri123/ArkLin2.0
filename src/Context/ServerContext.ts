import { createContext } from "react";
import { IMO_Instance } from "../Shared/Api/MongoDB";

export default createContext<{
  InstanceData: Record<string, IMO_Instance>;
  HasData: boolean;
}>({
  InstanceData: {},
  HasData: false,
});
