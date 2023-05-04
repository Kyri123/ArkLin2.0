import {
	useContext,
	useEffect
}                       from "react";
import type { TPermissions } from "../Shared/Enum/User.Enum";
import AccountContext   from "../Context/AccountContext";

export default function usePermissionPage( Permission : TPermissions ) {
	const { Account } = useContext( AccountContext );

	useEffect( () => {
		if ( !Account.HasPermission( Permission ) ) {
			window.location.href = "/home/401";
		}
	}, [ Account, Permission ] );
}
