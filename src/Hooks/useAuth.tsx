import { useMemo }         from "react";
import FrontendUserLib     from "../Lib/User.Lib";
import { useLocalStorage } from "@kyri123/k-reactutils";

export default function useAuth() {
	const { Storage, SetStorage } = useLocalStorage(
		"AuthToken",
		""
	);

	const UserData = useMemo<FrontendUserLib>( () => {
		return new FrontendUserLib( Storage );
	}, [ Storage ] );

	const Logout = () => {
		SetStorage( "" );
		//window.location.href = "/signin";
	};

	return {
		Token: Storage,
		SetToken: SetStorage,
		User: UserData,
		Logout: Logout
	};
}
