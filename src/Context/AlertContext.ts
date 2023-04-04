import React, { createContext }  from "react";
import { IAPIResponseBase }      from "../Types/API";
import { IAcceptActionFunction } from "../Components/Elements/CAcceptAction";

export default createContext<{
	DoSetAlert : ( Value : IAPIResponseBase | undefined ) => void,
	setAcceptAction : React.Dispatch<React.SetStateAction<IAcceptActionFunction<any>>>
}>( {
	DoSetAlert: () => {
	},
	setAcceptAction: () => {
	}
} );