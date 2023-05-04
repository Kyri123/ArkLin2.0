/** @format */

import ReactDOM       from "react-dom/client";

import "@kyri123/k-javascript-utils/lib/useAddons";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "icheck-bootstrap/icheck-bootstrap.min.css";
import "@style/index.css";
import "@style/Ribbon.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import {
	Navigate,
	RouterProvider
}                     from "react-router-dom";
import { rootRouter } from "@app/Router";

const root = ReactDOM.createRoot(
	document.getElementById( "root" ) as HTMLElement
);

root.render(
	<RouterProvider router={ rootRouter } fallbackElement={ <Navigate to={ "/error/404" }/> }/>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals( console.log );
