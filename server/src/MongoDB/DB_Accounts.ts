import * as mongoose  from "mongoose";
import crypto         from "crypto";
import type { EPerm } from "@shared/Enum/User.Enum";
import type { MongoBase }  from "@app/Types/MongoDB";

export interface UserAccountMethods {
	setPassword : ( password : string ) => void;
	validPassword : ( password : string ) => boolean;
}

const UserAccountSchema = new mongoose.Schema( {
	username: { type: String, unique: true, require: true },
	password: { type: String, require: false },
	mail: { type: String, unique: true, require: true },
	servers: { type: [ String ], default: [], require: true },
	permissions: { type: [ String ], default: [], require: true },
	hash: { type: String, required: true },
	salt: { type: String, required: true }
}, {
	timestamps: true, methods: {
		setPassword: function( password ) {
			this.salt = crypto.randomBytes( 16 ).toString( "hex" );
			this.hash = crypto.pbkdf2Sync( password, this.salt, 1000, 256, `sha512` ).toString( `hex` );
		},
		validPassword: function( password ) {
			const hash = crypto.pbkdf2Sync( password, this.salt!, 1000, 256, `sha512` ).toString( `hex` );
			return this.hash === hash;
		}
	}
} );

interface UserAccountInterface extends mongoose.InferSchemaType<typeof UserAccountSchema> {
	role : EPerm;
}

export type UserAccount = UserAccountInterface & MongoBase
export type ClientUserAccount = Omit<UserAccount, "hash" | "salt" | "password" | "__v">;

export default mongoose.model<UserAccount>( "accounts", UserAccountSchema );
