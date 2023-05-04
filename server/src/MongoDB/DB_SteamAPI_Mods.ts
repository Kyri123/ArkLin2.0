import * as mongoose      from "mongoose";
import type { MongoBase } from "@app/Types/MongoDB";

const SteamModSchema = new mongoose.Schema( {
	publishedfileid: { type: String, require: true, unique: true },
	result: { type: Number, require: true },
	creator: { type: String, require: true },
	creator_app_id: { type: Number, require: true },
	consumer_app_id: { type: Number, require: true },
	filename: { type: String, require: true },
	file_size: { type: Number, require: true },
	file_url: { type: String, require: true },
	hcontent_file: { type: String, require: true },
	preview_url: { type: String, require: true },
	hcontent_preview: { type: String, require: true },
	title: { type: String, require: true },
	description: { type: String, require: true },
	time_created: { type: Number, require: true },
	time_updated: { type: Number, require: true },
	visibility: { type: Number, require: true },
	banned: { type: Number, require: true },
	ban_reason: { type: String, require: true },
	subscriptions: { type: Number, require: true },
	favorited: { type: Number, require: true },
	lifetime_subscriptions: { type: Number, require: true },
	lifetime_favorited: { type: Number, require: true },
	views: { type: Number, require: true },
	tags: {
		type: [
			{
				tag: { type: String, require: true }
			}
		]
	}
} );


export type SteamMod = mongoose.InferSchemaType<typeof SteamModSchema> & MongoBase
export default mongoose.model<SteamMod>( "steamapi_mods", SteamModSchema );
