import {
	createBrowserRouter,
	createRoutesFromElements,
	Navigate,
	Route
}            from "react-router-dom";
import React from "react";

const rootRouter = createBrowserRouter( createRoutesFromElements(
	<>
		<Route path="/" loader={ async( { request, params } ) => {
			const { loader } = await import( "@app/MainLayout_Loader" );
			return loader( { request, params } );
		} } lazy={ async() => await import("@app/MainLayout") }>
			<Route path="/auth/login" element={ <></> }/>
			<Route path="/auth/reset/:token" element={ <></> }/>
			<Route path="/auth/register" element={ <></> }/>

			<Route index element={ <></> }/>
 
			<Route path="error/:statusCode" element={ <></> }/>
		</Route>

		<Route path="*" element={ <Navigate to={ "error/404" }/> }/>
	</>
) );

export {
	rootRouter
};