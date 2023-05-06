import {
	handleTRCPErr,
	router,
	serverProcedure
}                    from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server";
import {
	string,
	z
}                    from "zod";
import _             from "lodash";

export const auth_serverConfig = router( {
	updateConfigClearText: serverProcedure.input( z.object( {
		file: string(),
		content: string()
	} ) ).mutation( async( { ctx, input } ) => {
		const { file, content } = input;
		const { server } = ctx;
		try {
			server.SetServerConfigRaw( file, content );
			return "Konfiguration wurde erfolgreich gespeichert";
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	updateMods: serverProcedure.input( z.object( {
		mods: z.array( z.number() )
	} ) ).mutation( async( { ctx, input } ) => {
		const { mods } = input;
		const { server } = ctx;
		try {
			const config = _.cloneDeep( server.GetConfig() );
			config.ark_GameModIds = mods;

			if ( await server.SetServerConfig( "arkmanager.cfg", config ) ) {
				return "Mods bearbeitet";
			}
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),


	getConfigClearText: serverProcedure.input( z.object( {
		file: string()
	} ) ).query( async( { ctx, input } ) => {
		const { file } = input;
		const { server } = ctx;
		try {
			return server.GetConfigContentRaw( file );
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),


	getConfigs: serverProcedure.query( async( { ctx } ) => {
		const { server } = ctx;
		try {
			return server.GetConfigFiles();
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );