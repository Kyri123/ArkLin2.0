import type * as core       from "express-serve-static-core";
import type {
	Request,
	Response
}                           from "express-serve-static-core";
import { CreateUrl }        from "@server/Lib/PathBuilder.Lib";
import { MW_REST }          from "@server/trpc/middleware";
import type { UserAccount } from "@server/MongoDB/DB_Accounts";
import DB_Instances         from "@server/MongoDB/DB_Instances";
import { dataResponse }     from "@server/Lib/openApi.response";
import { EPerm }            from "@shared/Enum/User.Enum";

export default function( Api : core.Express ) {
	let Url = CreateUrl( "open/server/all" );
	Api.get( Url, MW_REST, async( request : Request<any, any, { user : UserAccount }>, response : Response ) => {
		try {
			if ( request.body.user.permissions.includes( EPerm.Super ) ) {
				const servers = await DB_Instances.find( {}, {
					"ArkmanagerCfg.ark_ServerAdminPassword": 0,
					"ArkmanagerCfg.ark_ServerPassword": 0,
					"ArkmanagerCfg.discordWebhookURL": 0
				} );
				return response.json( dataResponse( servers ) );
			}

			const servers = await DB_Instances.find( { Instance: request.body.user.servers }, {
				"ArkmanagerCfg.ark_ServerAdminPassword": 0,
				"ArkmanagerCfg.ark_ServerPassword": 0,
				"ArkmanagerCfg.discordWebhookURL": 0
			} );
			return response.json( dataResponse( servers ) );
		}
		catch ( e ) {

		}
		return response.json( dataResponse( [] ) );
	} );

	Url = CreateUrl( "open/server/:instance" );
	Api.get( Url, MW_REST, async( request : Request<any, any, { user : UserAccount }>, response : Response ) => {
		const { instance } = request.params;
		try {
			if ( instance?.length > 0 ) {
				if ( request.body.user.permissions.includes( EPerm.Super ) ) {
					const servers = await DB_Instances.find( { Instance: instance }, {
						"ArkmanagerCfg.ark_ServerAdminPassword": 0,
						"ArkmanagerCfg.ark_ServerPassword": 0,
						"ArkmanagerCfg.discordWebhookURL": 0
					} );
					return response.json( dataResponse( servers ) );
				}

				const servers = await DB_Instances.find( { Instance: instance }, {
					"ArkmanagerCfg.ark_ServerAdminPassword": 0,
					"ArkmanagerCfg.ark_ServerPassword": 0,
					"ArkmanagerCfg.discordWebhookURL": 0
				} );
				return response.json( dataResponse( servers ) );
			}
		}
		catch ( e ) {

		}
		return response.json( dataResponse( [] ) );
	} );
}
