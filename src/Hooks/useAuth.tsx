import { useMemo }         from "react";
import User                from "../Lib/User.Lib";
import { useLocalStorage } from "@kyri123/k-reactutils";
import { AUTHTOKEN }       from "@app/Lib/constance";

export default function useAuth() {
	const { Storage, SetStorage, ResetStorage } = useLocalStorage(
		AUTHTOKEN,
		""
	);

	const UserData = useMemo<User>( () => {
		return new User( Storage );
	}, [ Storage ] );

	return {
		Token: Storage,
		SetToken: SetStorage,
		User: UserData,
		Logout: ResetStorage
	};
}
