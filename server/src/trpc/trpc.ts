import * as trpc             from "@trpc/server";
import { TRPCError }         from "@trpc/server";
import type * as trpcExpress from "@trpc/server/adapters/express";
import type User             from "@app/Lib/User.Lib";
import superjson             from "superjson";
import { z }                 from "zod";

export function handleTRCPErr( e : unknown ) {
	if ( e instanceof TRPCError ) {
		throw new TRPCError( { message: e.message, code: e.code } );
	}
	else if ( e instanceof Error ) {
		SystemLib.LogError( "tRCP", e.message );
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	}
}

export interface Context {
	token : string,
	userClass : User,
}

export const createContext = async( { req } : trpcExpress.CreateExpressContextOptions ) => {
	const ctx : Context = {
		token: req.body.JsonWebToken,
		userClass: req.body.UserClass
	};

	return ctx;
};

const t = trpc.initTRPC.context<Context>().create( {
	transformer: superjson,
	isDev: SystemLib.IsDevMode
} );


export const router = t.router;
export const publicProcedure = t.procedure;
export const authProcedure = t.procedure;
export const serverProcedure = t.procedure.input( z.object( {
	instance: z.string()
} ) );