import { useLocalStorage } from "@kyri123/k-reactutils";
import { AUTHTOKEN }       from "@app/Lib/constance";

export default function useAuth() {
	const { Storage, SetStorage, ResetStorage } = useLocalStorage(
		AUTHTOKEN,
		""
	);

	return {
		Token: Storage,
		SetToken: SetStorage,
		Logout: ResetStorage
	};
}
