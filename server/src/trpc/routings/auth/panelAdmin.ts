import {
	authProcedure,
	handleTRCPErr,
	permissionMiddleware,
	router
}                    from "@server/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { EPerm }     from "@shared/Enum/User.Enum";
import { RunUpdate } from "@server/Lib/System.Lib";
import { z }         from "zod";
import path          from "path";
import fs            from "fs";

export const auth_panelAdmin = router( {
	setConfig: authProcedure.use( permissionMiddleware( EPerm.PanelSettings ) ).input( z.object( {
		file: z.string(),
		content: z.any()
	} ) ).use( permissionMiddleware( EPerm.PanelLog ) ).mutation( async( { input } ) => {
		const { file, content } = input;
		try {
			if ( typeof content !== "object" ) {
				throw new TRPCError( { message: "Invalid content", code: "BAD_REQUEST" } );
			}
			fs.writeFileSync( path.join( __configdir, `${ file }.json` ), JSON.stringify( content, null, 4 ) );
			return `${ file }.json wurde erfolgreich geändert. Das Panel muss neugestartet werden um alle änderungen zu übernehmen.`;
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	getConfig: authProcedure.use( permissionMiddleware( EPerm.PanelSettings ) ).input( z.string() ).use( permissionMiddleware( EPerm.PanelLog ) ).query( async( { input } ) => {
		try {
			return JSON.parse( fs.readFileSync( path.join( __configdir, `${ input }.json` ), "utf-8" ) );
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),


	update: authProcedure.use( permissionMiddleware( EPerm.PanelSettings ) ).mutation( async() => {
		try {
			RunUpdate();
			return "Panel wird Geupdated!";
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} ),

	restart: authProcedure.use( permissionMiddleware( EPerm.PanelLog ) ).mutation( async() => {
		try {
			setTimeout( () => {
				SystemLib.LogWarning( "system",
					"User Request:",
					SystemLib.ToBashColor( "Red" ),
					"RESTART"
				);
				process.exit( 0 );
			}, 1000 );
			return "Panel wird neugestartet!";
		}
		catch ( e ) {
			handleTRCPErr( e );
		}
		throw new TRPCError( { message: "Etwas ist schief gelaufen...", code: "INTERNAL_SERVER_ERROR" } );
	} )
} );