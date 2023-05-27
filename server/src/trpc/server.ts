import { BC } from "@/server/src/Lib/system.Lib";
import { expressMiddlewareAuth } from "@server/trpc/middleware";
import { authAccountManagement } from "@server/trpc/routings/admin/accountManagement";
import { authClusterManagement } from "@server/trpc/routings/auth/clusterManagement";
import { authServerConfig } from "@server/trpc/routings/auth/config";
import { authGlobalState } from "@server/trpc/routings/auth/globalState";
import { authLogs } from "@server/trpc/routings/auth/logs";
import { authPanelAdmin } from "@server/trpc/routings/auth/panelAdmin";
import { authServerAction } from "@server/trpc/routings/auth/serverAction";
import { authSteamapi } from "@server/trpc/routings/auth/steamapi";
import { authUser } from "@server/trpc/routings/auth/user";
import { publicCreateAccount } from "@server/trpc/routings/public/createAccount";
import { publicGithub } from "@server/trpc/routings/public/github";
import { publicLogin } from "@server/trpc/routings/public/login";
import { publicResetPassword } from "@server/trpc/routings/public/resetPassword";
import { publicValidate } from "@server/trpc/routings/public/validate";
import {
	createContext,
	router
} from "@server/trpc/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";


const publicRouter = router( {
	validate: publicValidate,
	login: publicLogin,
	register: publicCreateAccount,
	password: publicResetPassword,
	github: publicGithub
} );
const authRouter = router( {
	user: authUser,
	globaleState: authGlobalState,
	panelAdmin: authPanelAdmin,
	server: router( {
		clusterManagement: authClusterManagement,
		action: authServerAction,
		log: authLogs,
		config: authServerConfig,
		api: authSteamapi
	} ),
	admin: router( {
		account: authAccountManagement
	} )
} );


SystemLib.log( "start", "register TRCP on", BC( "Red" ), "/api/v2/*" );
Api.use( "/api/v2/public", trpcExpress.createExpressMiddleware( {
	router: publicRouter,
	createContext
} ) );
Api.use( "/api/v2/auth", expressMiddlewareAuth, trpcExpress.createExpressMiddleware( {
	router: authRouter,
	createContext
} ) );

export type PublicRouter = typeof publicRouter;
export type AuthRouter = typeof authRouter;
