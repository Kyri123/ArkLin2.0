import * as mongoose      from "mongoose";
import type { MongoBase } from "@app/Types/MongoDB";
import { z }              from "zod";

const ZodGithubBranchSchema = z.object( {
	name: z.string(),
	url: z.string(),
	sha: z.string(),
	protected: z.boolean()
} );

const GithubBranchSchema = new mongoose.Schema( {
	name: { type: String, unique: true },
	url: { type: String },
	sha: { type: String },
	protected: { type: Boolean }
} );

export type GithubBranch = z.infer<typeof ZodGithubBranchSchema> & MongoBase
export default mongoose.model<GithubBranch>( "github_branches", GithubBranchSchema );
export {
	ZodGithubBranchSchema,
	GithubBranchSchema
};
