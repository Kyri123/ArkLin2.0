import { createContext } from "react";
import User              from "../Lib/User.Lib";


export default createContext<{
	user: User
}>( {
	user: new User( "" )
} );
