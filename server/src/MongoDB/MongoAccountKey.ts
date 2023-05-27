import type { MongoBase } from "@app/Types/MongoDB";
import * as mongoose from "mongoose";
import { z } from "zod";


const zodAccountKeySchema = z.object( {
	key: z.string(),
	asSuperAdmin: z.boolean(),
	isPasswordReset: z.boolean().optional(),
	userId: z.string().optional()
} );

const accountKeySchema = new mongoose.Schema( {
	key: { type: String, unique: true, require: true },
	asSuperAdmin: { type: Boolean, default: false, require: true },
	isPasswordReset: { type: Boolean, default: false, require: false },
	userId: { type: String, unique: false, require: false }
} );

export type AccountKey = z.infer<typeof zodAccountKeySchema> & MongoBase;


export default mongoose.model<AccountKey>( "accountkeys", accountKeySchema );
export {
	accountKeySchema,
	zodAccountKeySchema
};

