import { useMemo }         from "react";
import FrontendUserLib     from "../Lib/User.Lib";
import { useLocalStorage } from "@kyri123/k-reactutils";

export default function useAuth() {
	const { Storage, SetStorage, ResetStorage } = useLocalStorage(
		"AuthToken",
		""
	);

	const UserData = useMemo<FrontendUserLib>( () => {
		return new FrontendUserLib( Storage );
	}, [ Storage ] );

	return {
		Token: Storage,
		SetToken: SetStorage,
		User: UserData,
		Logout: ResetStorage
	};
}
