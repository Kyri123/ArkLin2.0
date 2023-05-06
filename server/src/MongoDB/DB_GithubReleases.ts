import * as mongoose      from "mongoose";
import type { MongoBase } from "@app/Types/MongoDB";
import { z }              from "zod";

const ZodGithubReleaseSchema = z.object( {
	assets_url: z.string(),
	body: z.string(),
	created_at: z.string(),
	draft: z.boolean(),
	html_url: z.string(),
	id: z.number(),
	name: z.string(),
	node_id: z.string(),
	prerelease: z.boolean(),
	sha: z.string(),
	protected: z.boolean(),
	published_at: z.string(),
	tag_name: z.string(),
	target_commitish: z.string(),
	upload_url: z.string(),
	url: z.string()
} );

const GithubReleaseSchema = new mongoose.Schema( {
	assets_url: { type: String },
	body: { type: String },
	created_at: { type: String },
	draft: { type: Boolean },
	html_url: { type: String },
	id: { type: Number, unique: true },
	name: { type: String },
	node_id: { type: String },
	prerelease: { type: Boolean },
	published_at: { type: String },
	tag_name: { type: String },
	target_commitish: { type: String },
	upload_url: { type: String },
	url: { type: String }
} );


export type GithubRelease = z.infer<typeof ZodGithubReleaseSchema> & MongoBase
export default mongoose.model<GithubRelease>( "github_releases", GithubReleaseSchema );
export {
	ZodGithubReleaseSchema,
	GithubReleaseSchema
};
