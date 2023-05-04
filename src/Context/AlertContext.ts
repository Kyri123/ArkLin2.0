import type React                     from "react";
import { createContext }              from "react";
import type { IAcceptActionFunction } from "../Pages/MainApp/PageComponents/General/CAcceptAction";
import type { IAPIResponseBase }           from "@app/Types/API_Response";

export default createContext<{
	DoSetAlert : ( Value : IAPIResponseBase<true> | undefined ) => void;
	setAcceptAction : React.Dispatch<
		React.SetStateAction<IAcceptActionFunction<any>>
	>;
}>( {
	DoSetAlert: () => {
	},
	setAcceptAction: () => {
	}
} );
