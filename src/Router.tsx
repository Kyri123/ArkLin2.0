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
						path: "/app/server/:instanceName/",
						lazy: async() => await import("@page/app/server/Layout"),
						loader: async( { request, params } ) => {
							const { loader } = await import( "@page/app/loader/server/Layout" );
							return loader( { request, params } );
						},
						children: [
							{
								path: "/app/server/:instanceName/logs",
								lazy: async() => await import("@page/app/server/[instanceName]/logs"),
								loader: async( { request, params } ) => {
									const { loader } = await import( "@page/app/loader/server/logs" );
									return loader( { request, params } );
								}
							},
							{
								path: "/app/server/:instanceName/mods",
								lazy: async() => await import("@page/app/server/[instanceName]/mods")
							},
							{
								path: "/app/server/:instanceName/config",
								lazy: async() => await import("@page/app/server/[instanceName]/config")
							}
						]
					},
					{
						path: "/app/paneladmin",
						lazy: async() => await import("@page/app/paneladmin"),
						loader: async( { request, params } ) => {
							const { loader } = await import( "@page/app/loader/paneladmin" );
							return loader( { request, params } );
						}
					},
					{
						path: "/app/account",
						lazy: async() => await import("@page/app/account"),
						loader: async( { request, params } ) => {
							const { loader } = await import( "@page/app/loader/me" );
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
					},
					{
						path: "/app/cluster",
						lazy: async() => await import("@page/app/cluster"),
						loader: async( { request, params } ) => {
							const { loader } = await import( "@page/app/loader/cluster" );
							return loader( { request, params } );
						}
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