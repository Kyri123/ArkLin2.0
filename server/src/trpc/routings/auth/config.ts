import {
	handleTRCPErr,
	router,
	serverProcedure
} from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server";
import _ from "lodash";
import {
	string,
	z
} from "zod";


export const authServerConfig = router( {
	updateConfigClearText: serverProcedure.input( z.object( {
		file: string(),
		content: string()
	} ) ).mutation( async( { ctx, input } ) => {
		const { file, content } = input;
		const { server } = ctx;
		try {
			server.setServerConfigRaw( file, content );
			return "Konfiguration wurde erfolgreich gespeichert";
		} catch( e ) {
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
			const config = _.cloneDeep( server.getConfig() );
			config.ark_GameModIds = mods;

			if( await server.setServerConfig( "arkmanager.cfg", config ) ) {
				return "Mods bearbeitet";
			}
		} catch( e ) {
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
			return server.getConfigContentRaw( file );
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),


	getConfigs: serverProcedure.query( async( { ctx } ) => {
		const { server } = ctx;
		try {
			return server.getConfigFiles();
		} catch( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );
