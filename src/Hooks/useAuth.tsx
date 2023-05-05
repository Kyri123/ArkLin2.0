import { useLocalStorage } from "@kyri123/k-reactutils";
import { AUTHTOKEN }       from "@app/Lib/constance";
import { useNavigate }     from "react-router-dom";
import {
	fireSwalFromApi,
	tRPC_Auth
}                          from "@app/Lib/tRPC";

export default function useAuth() {
	const navigate = useNavigate();
	const { Storage, SetStorage, ResetStorage } = useLocalStorage(
		AUTHTOKEN,
		""
	);

	const Logout = async() => {
		try {
			await tRPC_Auth.user.logout.mutate();
			fireSwalFromApi( "Du wurdest ausgeloggt!", true );
		}
		catch ( e ) {
			console.error( e );
		}
		ResetStorage();
		navigate( "/auth/login" );
	};

	return {
		Token: Storage,
		SetToken: SetStorage,
		Logout
	};
}
