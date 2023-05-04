import * as mongoose from "mongoose";
import type { MongoBase } from "@app/Types/MongoDB";

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


export type GithubRelease = mongoose.InferSchemaType<typeof GithubReleaseSchema> & MongoBase
export default mongoose.model<GithubRelease>( "github_releases", GithubReleaseSchema );
