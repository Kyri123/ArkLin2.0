import * as mongoose      from "mongoose";
import type { MongoBase } from "@app/Types/MongoDB";
import { z }              from "zod";

const ZodAccountKeySchema = z.object( {
	key: z.string(),
	asSuperAdmin: z.boolean(),
	isPasswordReset: z.boolean().optional(),
	userId: z.string().optional()
} );

const AccountKeySchema = new mongoose.Schema( {
	key: { type: String, unique: true, require: true },
	asSuperAdmin: { type: Boolean, default: false, require: true },
	isPasswordReset: { type: Boolean, default: false, require: false },
	userId: { type: String, unique: false, require: false }
} );

export type AccountKey = z.infer<typeof ZodAccountKeySchema> & MongoBase


export default mongoose.model<AccountKey>( "accountkey", AccountKeySchema );
export {
	AccountKeySchema,
	ZodAccountKeySchema
};
