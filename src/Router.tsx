import {
	createBrowserRouter,
	Navigate
} from "react-router-dom";

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
				lazy: async() => await import("@page/auth/Layout"),
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
							const { loader } = await import( "@page/auth/loader/[token]" );
							return loader( { request, params } );
						}
					}
				]
			},
			// end auth ----------------------------------


			// start App --------------------------------
			{
				path: "/app/",
				lazy: async() => await import("@page/app/Layout"),
				loader: async( { request, params } ) => {
					const { loader } = await import( "@page/app/loader/Layout" );
					return loader( { request, params } );
				},
				children: [
					{
						index: true,
						lazy: async() => await import("@page/app/Index"),
						loader: async( { request, params } ) => {
							const { loader } = await import( "@page/app/loader/index" );
							return loader( { request, params } );
						}
					},
					{
						path: "/app/userManagement",
						lazy: async() => await import("@page/app/userManagement"),
						loader: async( { request, params } ) => {
							const { loader } = await import( "@page/app/loader/userManagement" );
							return loader( { request, params } );
						}
					},
					{
						path: "/app/adminserver",
						lazy: async() => await import("@page/app/adminServer")
					}
				]
			},
			// end App ----------------------------------
			{
				path: "*",
				element: <Navigate to={ "/error/404" }/>
			},
			{
				path: "/error/:statusCode",
				lazy: async() => await import("@page/error/[statusCode]")
			}
		]
	}
] );

export {
	rootRouter
};