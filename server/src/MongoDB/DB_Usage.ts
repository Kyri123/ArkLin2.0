import * as mongoose      from "mongoose";
import type { MongoBase } from "@app/Types/MongoDB";

const UsageSchema = new mongoose.Schema( {
	CPU: { type: Number, required: true },
	MemMax: { type: Number, required: true },
	MemUsed: { type: Number, required: true },
	DiskMax: { type: Number, required: true },
	DiskUsed: { type: Number, required: true },
	PanelNeedUpdate: { type: Boolean, required: true },
	PanelVersionName: { type: String, required: true },
	PanelBuildVersion: { type: String, required: true },
	NextPanelBuildVersion: { type: String },
	UpdateIsRunning: { type: Boolean }
} );


export type SystemUsage = mongoose.InferSchemaType<typeof UsageSchema> & MongoBase
export default mongoose.model<SystemUsage>( "usage", UsageSchema );
