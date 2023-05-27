import type { MongoBase } from "@app/Types/MongoDB";
import * as mongoose from "mongoose";
import { z } from "zod";


const zodGithubBranchSchema = z.object( {
	name: z.string(),
	url: z.string(),
	sha: z.string(),
	protected: z.boolean()
} );

const githubBranchSchema = new mongoose.Schema( {
	name: { type: String, unique: true },
	url: { type: String },
	sha: { type: String },
	protected: { type: Boolean }
} );

export type GithubBranch = z.infer<typeof zodGithubBranchSchema> & MongoBase;
export default mongoose.model<GithubBranch>( "github_branches", githubBranchSchema );
export {
	githubBranchSchema, zodGithubBranchSchema
};

