import React, { createContext }  from "react";
import { IAPIResponseBase }      from "../Shared/Type/API_Response";
import { IAcceptActionFunction } from "../Pages/MainApp/PageComponents/General/CAcceptAction";

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
