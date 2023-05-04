import type { FunctionComponent } from "react";
import { Outlet }                 from "react-router-dom";

const Component : FunctionComponent = () => {
	return (
		<Outlet/>
	);
};

export { Component };
