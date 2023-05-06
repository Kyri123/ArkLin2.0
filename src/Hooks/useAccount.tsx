import { useContext } from "react";
import AccountContext from "@context/AccountContext";

export default function useAccount() {
	const { user } = useContext( AccountContext );

	return { user };
}
