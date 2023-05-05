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
						path: "/app/version/:changelogTag",
						lazy: async() => await import("@page/app/version/[changelogTag]"),
						loader: async( { request, params } ) => {
							const { loader } = await import( "@page/app/loader/[changelogTag]" );
							return loader( { request, params } );
						}
					}
				]
			},
			// end App ----------------------------------


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