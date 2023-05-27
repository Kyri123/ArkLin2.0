/** @format */

import ReactDOM from "react-dom/client";

import reportWebVitals from "@/src/reportWebVitals";
import { rootRouter } from "@app/Router";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@kyri123/k-javascript-utils/lib/useAddons";
import "@style/App.css";
import "@style/Ribbon.scss";
import "@style/index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "icheck-bootstrap/icheck-bootstrap.min.css";
import { StrictMode } from "react";
import { RouterProvider } from "react-router-dom";


const root = ReactDOM.createRoot(
	document.getElementById( "root" ) as HTMLElement
);

root.render(
	<StrictMode>
		<RouterProvider router={ rootRouter } fallbackElement={ <></> } />
	</StrictMode>
);

// eslint-disable-next-line no-console
reportWebVitals( console.log );
