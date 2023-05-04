import * as mongoose from "mongoose";
import type { MongoBase } from "@app/Types/MongoDB";

const SteamModSchema = new mongoose.Schema(
	{
		publishedfileid: { type: String, unique: true },
		result: { type: Number },
		creator: { type: String },
		creator_app_id: { type: Number },
		consumer_app_id: { type: Number },
		filename: { type: String },
		file_size: { type: Number },
		file_url: { type: String },
		hcontent_file: { type: String },
		preview_url: { type: String },
		hcontent_preview: { type: String },
		title: { type: String },
		description: { type: String },
		time_created: { type: Number },
		time_updated: { type: Number },
		visibility: { type: Number },
		banned: { type: Number },
		ban_reason: { type: String },
		subscriptions: { type: Number },
		favorited: { type: Number },
		lifetime_subscriptions: { type: Number },
		lifetime_favorited: { type: Number },
		views: { type: Number },
		tags: {
			type: [
				{
					tag: { type: String }
				}
			]
		}
	},
	{ strict: true }
);


export type SteamMod = mongoose.InferSchemaType<typeof SteamModSchema> & MongoBase
export default mongoose.model<SteamMod>( "steamapi_mods", SteamModSchema );
