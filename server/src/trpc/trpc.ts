import { ServerLib } from "@/server/src/Lib/server.Lib";
import type User from "@app/Lib/User.Lib";
import type { TPermissions } from "@shared/Enum/User.Enum";
import { EPerm } from "@shared/Enum/User.Enum";
import * as trpc from "@trpc/server";
import { TRPCError } from "@trpc/server";
import type * as trpcExpress from "@trpc/server/adapters/express";
import superjson from "superjson";
import { z } from "zod";


export function handleTRCPErr( e: unknown ) {
	if( e instanceof TRPCError ) {
		throw new TRPCError( { message: e.message, code: e.code } );
	} else if( e instanceof Error ) {
		SystemLib.logError( "tRCP", e.message );
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	}
}

export interface Context {
	token: string,
	userClass: User
}

export const createContext = async( { req }: trpcExpress.CreateExpressContextOptions ) => {
	const ctx: Context = {
		token: req.body.JsonWebToken,
		userClass: req.body.UserClass
	};

	return ctx;
};

const t = trpc.initTRPC.context<Context>().create( {
	transformer: superjson,
	isDev: SystemLib.isDevMode
} );

export const middleware = t.middleware;

export const serverOwnerMiddleware = middleware( async opts => {
	const { instanceName } = opts.input as any;

	if( !instanceName ) {
		throw new TRPCError( { code: "BAD_REQUEST", message: "Server ID is required." } );
	}

	try {
		const server = await ServerLib.build( instanceName );
		if( server?.isValid() ) {
			return opts.next( {
				ctx: {
					server: server
				}
			} );
		}
	} catch( e ) {
	}
	throw new TRPCError( { code: "BAD_REQUEST", message: "Server ID was not found." } );
} );

export const permissionMiddleware = ( permission: TPermissions ) => middleware( async opts => {
	const { userClass } = opts.ctx;

	if( !userClass || !userClass.hasPermission( permission ) ) {
		throw new TRPCError( { code: "UNAUTHORIZED", message: "Permission is required." } );
	}

	return opts.next();
} );


export const router = t.router;
export const publicProcedure = t.procedure;
export const authProcedure = t.procedure;
export const superAdminProcedure = t.procedure.use( permissionMiddleware( EPerm.Super ) );
export const serverProcedure = t.procedure.input( z.object( {
	instanceName: z.string()
} ) ).use( serverOwnerMiddleware );
