import { createUrl } from "@/server/src/Lib/pathBuilder.Lib";
import { dataResponse } from "@server/Lib/openApi.response";
import type { UserAccount } from "@server/MongoDB/MongoAccounts";
import MongoInstances from "@server/MongoDB/MongoInstances";
import { expressMiddlewareRestAPI } from "@server/trpc/middleware";
import {
	EPerm,
	GetEnumValue
} from "@shared/Enum/User.Enum";
import type * as core from "express-serve-static-core";
import type {
	Request,
	Response
} from "express-serve-static-core";


export default function( Api: core.Express ) {
	let url = createUrl( "open/server/all" );
	Api.get( url, expressMiddlewareRestAPI, async( request: Request<any, any, { user: UserAccount }>, response: Response ) => {
		try {
			if( request.body.user.permissions.includes( GetEnumValue( EPerm.Super ) ) ) {
				const servers = await MongoInstances.find( {}, {
					"ArkmanagerCfg.ark_ServerAdminPassword": 0,
					"ArkmanagerCfg.ark_ServerPassword": 0,
					"ArkmanagerCfg.discordWebhookURL": 0
				} );
				return response.json( dataResponse( servers ) );
			}

			const servers = await MongoInstances.find( { Instance: request.body.user.servers }, {
				"ArkmanagerCfg.ark_ServerAdminPassword": 0,
				"ArkmanagerCfg.ark_ServerPassword": 0,
				"ArkmanagerCfg.discordWebhookURL": 0
			} );
			return response.json( dataResponse( servers ) );
		} catch( e ) {
			if( e instanceof Error ) {
				SystemLib.logError( "api", e.message );
			}
		}
		return response.json( dataResponse( [] ) );
	} );

	url = createUrl( "open/server/:instance" );
	Api.get( url, expressMiddlewareRestAPI, async( request: Request<any, any, { user: UserAccount }>, response: Response ) => {
		const { instance } = request.params;
		try {
			if( instance?.length > 0 ) {
				if( request.body.user.permissions.includes( GetEnumValue( EPerm.Super ) ) ) {
					const servers = await MongoInstances.find( { Instance: instance }, {
						"ArkmanagerCfg.ark_ServerAdminPassword": 0,
						"ArkmanagerCfg.ark_ServerPassword": 0,
						"ArkmanagerCfg.discordWebhookURL": 0
					} );
					return response.json( dataResponse( servers ) );
				}

				const servers = await MongoInstances.find( { Instance: instance }, {
					"ArkmanagerCfg.ark_ServerAdminPassword": 0,
					"ArkmanagerCfg.ark_ServerPassword": 0,
					"ArkmanagerCfg.discordWebhookURL": 0
				} );
				return response.json( dataResponse( servers ) );
			}
		} catch( e ) {

		}
		return response.json( dataResponse( [] ) );
	} );
}
