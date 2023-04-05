import { createContext } from "react";
import FrontendUserLib   from "../Lib/User.Lib";

export default createContext<{
	Account : FrontendUserLib;
}>( {
	Account: new FrontendUserLib( "" )
} );
