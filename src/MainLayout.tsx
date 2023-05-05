import type { FunctionComponent } from "react";
import {
	Outlet,
	useLoaderData
}                                 from "react-router-dom";
import type { AuthLoaderProps }        from "@app/MainLayout_Loader";
import AccountContext             from "@context/AccountContext";
import User                       from "@app/Lib/User.Lib";

const Component : FunctionComponent = () => {
	const { token } = useLoaderData() as AuthLoaderProps;

	return (
		<AccountContext.Provider value={ { user: new User( token ) } }>
			<Outlet/>
		</AccountContext.Provider>
	);
};

export { Component };
