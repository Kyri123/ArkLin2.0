import * as mongoose      from "mongoose";
import type { MongoBase } from "@app/Types/MongoDB";

const AccountKeysSchema = new mongoose.Schema( {
	key: { type: String, unique: true, index: true, require: true },
	asSuperAdmin: { type: Boolean, default: false, require: true },
	isAdminReset: { type: Boolean, default: false, require: false }
} );

export type AccountKeys = mongoose.InferSchemaType<typeof AccountKeysSchema> & MongoBase


export default mongoose.model<AccountKeys>( "accountkey", AccountKeysSchema );
export { AccountKeysSchema };
