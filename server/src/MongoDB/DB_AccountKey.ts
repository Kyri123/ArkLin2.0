import * as mongoose      from "mongoose";
import type { MongoBase } from "@app/Types/MongoDB";

const AccountKeySchema = new mongoose.Schema( {
	key: { type: String, unique: true, index: true, require: true },
	asSuperAdmin: { type: Boolean, default: false, require: true },
	isPasswordReset: { type: Boolean, default: false, require: false },
	userId: { type: String, unique: false, require: false }
} );

export type AccountKey = mongoose.InferSchemaType<typeof AccountKeySchema> & MongoBase


export default mongoose.model<AccountKey>( "accountkey", AccountKeySchema );
export { AccountKeySchema };
