import type { MongoBase } from "@app/Types/MongoDB";
import { MakeRandomString } from "@kyri123/k-javascript-utils";
import crypto from "crypto";
import type { JwtPayload } from "jwt-decode";
import * as mongoose from "mongoose";
import { z } from "zod";


const zodUserAccountSchema = z.object( {
	username: z.string(),
	password: z.string().optional(),
	mail: z.string(),
	servers: z.array( z.string() ),
	permissions: z.array( z.string() ),
	hash: z.string(),
	salt: z.string(),
	apiKey: z.string().optional()
} );

export interface UserAccountMethods {
	setPassword: ( password: string ) => void,
	generateApiKey: () => void,
	validPassword: ( password: string ) => boolean
}

const userAccountSchema = new mongoose.Schema( {
	username: { type: String, require: true, unique: true },
	password: { type: String, require: false },
	mail: { type: String, unique: true, require: true },
	servers: { type: [ String ], default: [], require: true },
	permissions: { type: [ String ], default: [], require: true },
	hash: { type: String, required: true },
	salt: { type: String, required: true },
	apiKey: { type: String, required: false }
}, {
	timestamps: true,
	methods: {
		setPassword: function( password ) {
			this.salt = crypto.randomBytes( 16 ).toString( "hex" );
			this.hash = crypto.pbkdf2Sync( password, this.salt, 1000, 256, `sha512` ).toString( `hex` );
		},
		validPassword: function( password ) {
			const hash = crypto.pbkdf2Sync( password, this.salt!, 1000, 256, `sha512` ).toString( `hex` );
			return this.hash === hash;
		},
		generateApiKey: function() {
			this.apiKey = MakeRandomString( 30 );
		}
	}
} );

interface UserAccountInterface extends z.infer<typeof zodUserAccountSchema> {
	permissions: string[]
}

export type UserAccount = UserAccountInterface & MongoBase;
export type ClientUserAccount = Omit<UserAccount, "hash" | "salt" | "password" | "__v"> & JwtPayload;

export default mongoose.model<UserAccount, mongoose.Model<UserAccount, any, UserAccountMethods>>( "accounts", userAccountSchema );
export {
	userAccountSchema,
	zodUserAccountSchema
};

