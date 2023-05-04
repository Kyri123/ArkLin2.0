import * as mongoose      from "mongoose";
import type { MongoBase } from "@app/Types/MongoDB";
import { z }              from "zod";

const ZodSessionTokenSchema = z.object( {
	userid: z.string(),
	token: z.string(),
	expire: z.date()
} );

const SessionTokenSchema = new mongoose.Schema( {
	userid: { type: String, required: true },
	token: { type: String, required: true },
	expire: { type: Date, required: true }
}, { timestamps: true } );

export type SessionToken = z.infer<typeof ZodSessionTokenSchema> & MongoBase;

export default mongoose.model<SessionToken>( "usertoken", SessionTokenSchema );
export {
	SessionTokenSchema,
	ZodSessionTokenSchema
};