import { createContext } from "react";
import { TMO_Instance }  from "../Types/MongoDB";

export default createContext<{
	InstanceData : Record<string, TMO_Instance>;
	HasData : boolean;
}>( {
	InstanceData: {},
	HasData: false
} );
