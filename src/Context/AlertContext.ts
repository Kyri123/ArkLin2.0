import type React from "react";
import { createContext }  from "react";
import type { IAPIResponseBase }      from "../Shared/Type/API_Response";
import type { IAcceptActionFunction } from "../Pages/MainApp/PageComponents/General/CAcceptAction";

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
