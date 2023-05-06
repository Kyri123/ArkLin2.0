import * as trpcExpress           from "@trpc/server/adapters/express";
import { public_validate }        from "@server/trpc/routings/public/validate";
import { public_login }           from "@server/trpc/routings/public/login";
import { public_createAccount }   from "@server/trpc/routings/public/createAccount";
import {
	createContext,
	router
}                                 from "@server/trpc/trpc";
import { MW_Auth }                from "@server/trpc/middleware";
import { BC }                     from "@server/Lib/System.Lib";
import { public_resetPassword }   from "@server/trpc/routings/public/resetPassword";
import { public_github }          from "@server/trpc/routings/public/github";
import { auth_globalState }       from "@server/trpc/routings/auth/globalState";
import { auth_panelAdmin }        from "@server/trpc/routings/auth/panelAdmin";
import { auth_accountManagement } from "@server/trpc/routings/admin/accountManagement";
import { auth_serverAction }      from "@server/trpc/routings/auth/serverAction";
import { auth_user }              from "@server/trpc/routings/auth/user";
import { auth_clusterManagement } from "@server/trpc/routings/auth/clusterManagement";


const publicRouter = router( {
	validate: public_validate,
	login: public_login,
	register: public_createAccount,
	password: public_resetPassword,
	github: public_github
} );
const authRouter = router( {
	user: auth_user,
	globaleState: auth_globalState,
	panelAdmin: auth_panelAdmin,
	server: router( {
		clusterManagement: auth_clusterManagement,
		action: auth_serverAction
	} ),
	admin: router( {
		account: auth_accountManagement
	} )
} );


SystemLib.Log( "start", "register TRCP on", BC( "Red" ), "/api/v2/*" );
Api.use( "/api/v2/public", trpcExpress.createExpressMiddleware( {
	router: publicRouter,
	createContext
} ) );
Api.use( "/api/v2/auth", MW_Auth, trpcExpress.createExpressMiddleware( {
	router: authRouter,
	createContext
} ) );

export type PublicRouter = typeof publicRouter;
export type AuthRouter = typeof authRouter;