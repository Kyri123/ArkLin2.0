import type { MongoBase } from "@app/Types/MongoDB";
import * as mongoose from "mongoose";
import { z } from "zod";


const zodSessionTokenSchema = z.object( {
	userid: z.string(),
	token: z.string(),
	expire: z.date()
} );

const sessionTokenSchema = new mongoose.Schema( {
	userid: { type: String, required: true },
	token: { type: String, required: true },
	expire: { type: Date, required: true }
}, { timestamps: true } );

export type SessionToken = z.infer<typeof zodSessionTokenSchema> & MongoBase;

export default mongoose.model<SessionToken>( "usertoken", sessionTokenSchema );
export {
	sessionTokenSchema,
	zodSessionTokenSchema
};

