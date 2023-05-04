import * as mongoose      from "mongoose";
import type { MongoBase } from "@app/Types/MongoDB";

const SessionTokenSchema = new mongoose.Schema( {
	userid: { type: String, required: true },
	token: { type: String, required: true },
	expire: { type: Date, required: true }
}, { timestamps: true } );

export type SessionToken = mongoose.InferSchemaType<typeof SessionTokenSchema> & MongoBase;

export default mongoose.model<SessionToken>( "usertoken", SessionTokenSchema );
export { SessionTokenSchema };