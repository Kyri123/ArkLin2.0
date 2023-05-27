import { AUTHTOKEN } from "@app/Lib/constance";
import {
	apiAuth,
	fireSwalFromApi
} from "@app/Lib/tRPC";
import { useLocalStorage } from "@kyri123/k-reactutils";
import { useNavigate } from "react-router-dom";


export default function useAuth() {
	const navigate = useNavigate();
	const localStorage = useLocalStorage( AUTHTOKEN, "" );

	const logout = async() => {
		try {
			await apiAuth.user.logout.mutate();
			fireSwalFromApi( "Du wurdest ausgeloggt!", true );
		} catch( e ) {
			console.error( e );
		}
		localStorage.ResetStorage();
		navigate( "/auth/login" );
	};

	return {
		token: localStorage.Storage,
		setToken: localStorage.SetStorage,
		logout
	};
}
