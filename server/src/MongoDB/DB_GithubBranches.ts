import * as mongoose from "mongoose";
import type { MongoBase } from "@app/Types/MongoDB";

const GithubBranchSchema = new mongoose.Schema( {
	name: { type: String, unique: true },
	url: { type: String },
	sha: { type: String },
	protected: { type: Boolean }
} );


export type GithubBranch = mongoose.InferSchemaType<typeof GithubBranchSchema> & MongoBase
export default mongoose.model<GithubBranch>( "github_branches", GithubBranchSchema );
