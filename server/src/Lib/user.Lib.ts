import type User from "@app/Lib/User.Lib";
import type { UserAccount } from "@server/MongoDB/MongoAccounts";
import type { Cluster } from "@server/MongoDB/MongoCluster";
import MongoCluster from "@server/MongoDB/MongoCluster";
import type { Instance } from "@server/MongoDB/MongoInstances";
import MongoInstances from "@server/MongoDB/MongoInstances";
import MongoSessionToken from "@server/MongoDB/MongoSessionToken";
import { EPerm } from "@shared/Enum/User.Enum";
import * as crypto from "crypto";
import fs from "fs";
import * as jwt from "jsonwebtoken";
import path from "path";


export function getSecretAppToken(): string {
	if( global.APPTOKEN && typeof APPTOKEN === "string" ) {
		return APPTOKEN;
	}

	let token = crypto.randomBytes( 64 ).toString( "hex" );
	const tokenFile = path.join( CONFIGDIR, "app.token" );
	if( fs.existsSync( tokenFile ) ) {
		token = fs.readFileSync( tokenFile ).toString().trim();
	} else {
		fs.writeFileSync( tokenFile, token );
	}
	global.APPTOKEN = token;
	return APPTOKEN as string;
}

export async function createSession( User: Partial<UserAccount>, stayLoggedIn = false ): Promise<string | undefined> {
	delete User.salt;
	delete User.hash;
	try {
		const token = jwt.sign( User, getSecretAppToken(), {
			expiresIn: stayLoggedIn ? "28d" : "1d"
		} );
		const decoded = jwt.verify( token, getSecretAppToken() ) as jwt.JwtPayload;
		if( decoded ) {
			await MongoSessionToken.deleteMany( { expire: { $lte: new Date() } } );
			const session = await MongoSessionToken.create( {
				token,
				userid: User._id,
				expire: new Date( ( decoded.exp || 0 ) * 1000 )
			} );
			return session.token;
		}
	} catch( e ) {
		if( e instanceof Error ) {
			SystemLib.logError( "api", e.message );
		}
	}
	return undefined;
}

export async function getAllServerWithPermission( user: User ): Promise<Record<string, Instance>> {
	const arr = user.hasPermission( EPerm.ManagePanel ) ? await MongoInstances.find<Instance>( {} ) : await MongoInstances.find<Instance>( { servers: user.get.servers } );
	const result: Record<string, Instance> = {};
	for( const instance of arr ) {
		result[ instance.Instance ] = instance;
	}
	return result;
}

export async function getAllClusterWithPermission( user: User ): Promise<Record<string, Cluster>> {
	const arr = await MongoCluster.find( { Instances: { $in: Object.keys( await getAllServerWithPermission( user ) ) } } );
	const result: Record<string, Cluster> = {};
	for( const cluster of arr ) {
		result[ cluster._id ] = await cluster.toJSON();
	}
	return result;
}
