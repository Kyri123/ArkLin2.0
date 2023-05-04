import { createBrowserRouter } from "react-router-dom";

const rootRouter = createBrowserRouter( [
	{
		path: "/",
		lazy: async() => await import("@app/MainLayout"),
		loader: async( { request, params } ) => {
			const { loader } = await import( "@app/MainLayout_Loader" );
			return loader( { request, params } );
		},
		children: [
			// start auth --------------------------------
			{
				path: "/auth/",
				lazy: async() => await import("@page/auth/AuthLayout"),
				children: [
					{
						path: "/auth/login",
						lazy: async() => await import("@page/auth/login")
					},
					{
						path: "/auth/register",
						lazy: async() => await import("@page/auth/register")
					},
					{
						path: "/auth/reset/:token",
						lazy: async() => await import("@page/auth/reset/[token]"),
						loader: async( { request, params } ) => {
							const { loader } = await import( "@page/auth/reset/[token]_loader" );
							return loader( { request, params } );
						}
					}
				]
			},
			// end auth ----------------------------------
			{
				index: true,
				element: <></>
			},
			{
				path: "/error/:statusCode",
				element: <></>
			}
		]
	}
] );

export {
	rootRouter
};