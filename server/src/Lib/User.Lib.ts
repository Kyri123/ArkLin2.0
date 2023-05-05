import type { UserAccount }    from "@server/MongoDB/DB_Accounts";
import * as crypto             from "crypto";
import path                    from "path";
import fs                      from "fs";
import * as jwt                from "jsonwebtoken";
import DB_SessionToken         from "@server/MongoDB/DB_SessionToken";
import type User               from "@app/Lib/User.Lib";
import { EPerm }               from "@shared/Enum/User.Enum";
import type { Instance }       from "@server/MongoDB/DB_Instances";
import DB_Instances            from "@server/MongoDB/DB_Instances";
import type { Cluster } from "@server/MongoDB/DB_Cluster";
import DB_Cluster from "@server/MongoDB/DB_Cluster";

export function GetSecretAppToken() : string {
	if ( global.__AppToken && typeof __AppToken === "string" ) {
		return __AppToken;
	}

	let Token = crypto.randomBytes( 64 ).toString( "hex" );
	const TokenFile = path.join( __configdir, "app.token" );
	if ( fs.existsSync( TokenFile ) ) {
		Token = fs.readFileSync( TokenFile ).toString().trim();
	}
	else {
		fs.writeFileSync( TokenFile, Token );
	}
	global.__AppToken = Token;
	return __AppToken as string;
}

export async function CreateSession( User : Partial<UserAccount>, stayLoggedIn = false ) : Promise<string | undefined> {
	delete User.salt;
	delete User.hash;
	try {
		const Token = jwt.sign( User, GetSecretAppToken(), {
			expiresIn: stayLoggedIn ? "28d" : "1d"
		} );
		const Decoded = jwt.verify( Token, GetSecretAppToken() ) as jwt.JwtPayload;
		if ( Decoded ) {
			await DB_SessionToken.deleteMany( { expire: { $lte: new Date() } } );
			const session = await DB_SessionToken.create( {
				token: Token,
				userid: User._id,
				expire: new Date( ( Decoded.exp || 0 ) * 1000 )
			} );
			return session.token;
		}
	}
	catch ( e ) {
		if ( e instanceof Error ) {
			SystemLib.LogError( "api", e.message );
		}
	}
	return undefined;
}

export async function GetAllServerWithPermission( user : User ) : Promise<Record<string, Instance>> {
	const arr = user.HasPermission( EPerm.ManagePanel ) ? await DB_Instances.find<Instance>( {} ) : await DB_Instances.find<Instance>( { servers: user.Get.servers } );
	const result : Record<string, Instance> = {};
	for ( const instance of arr ) {
		result[ instance.Instance ] = instance;
	}
	return result;
}

export async function GetAllClusterWithPermission( user : User ) : Promise<Record<string, Cluster>> {
	const arr = await DB_Cluster.find( { Instances: { $in: Object.keys( await GetAllServerWithPermission ) } } );
	const result : Record<string, Cluster> = {};
	for ( const cluster of arr ) {
		result[ cluster._id ] = await cluster.toJSON();
	}
	return result;
}