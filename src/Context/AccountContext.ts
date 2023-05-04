import { createContext } from "react";
import User              from "../Lib/User.Lib";

export default createContext<{
	Account : User;
}>( {
	Account: new User( "" )
} );
