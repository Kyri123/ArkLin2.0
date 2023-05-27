import * as mongoose from "mongoose";
import { z } from "zod";


const zodUsageSchema = z.object( {
	CPU: z.number(),
	MemMax: z.number(),
	MemUsed: z.number(),
	DiskMax: z.number(),
	DiskUsed: z.number(),
	PanelNeedUpdate: z.boolean(),
	UpdateIsRunning: z.boolean(),
	PanelVersionName: z.string(),
	PanelBuildVersion: z.string(),
	NextPanelBuildVersion: z.string(),
	LogFiles: z.array( z.string() )
} );

const usageSchema = new mongoose.Schema( {
	CPU: { type: Number, required: true },
	MemMax: { type: Number, required: true },
	MemUsed: { type: Number, required: true },
	DiskMax: { type: Number, required: true },
	DiskUsed: { type: Number, required: true },
	PanelNeedUpdate: { type: Boolean, required: true },
	PanelVersionName: { type: String, required: true },
	PanelBuildVersion: { type: String, required: true },
	NextPanelBuildVersion: { type: String },
	UpdateIsRunning: { type: Boolean },
	LogFiles: { type: [ String ], required: true }
} );

export type SystemUsage = z.infer<typeof zodUsageSchema>;
export default mongoose.model<SystemUsage>( "usage", usageSchema );
export {
	usageSchema, zodUsageSchema
};

