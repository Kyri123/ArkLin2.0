import * as mongoose from "mongoose";
import { z }         from "zod";

const ZodUsageSchema = z.object( {
	CPU: z.number(),
	MemMax: z.number(),
	MemUsed: z.number(),
	DiskMax: z.number(),
	DiskUsed: z.number(),
	PanelNeedUpdate: z.boolean(),
	UpdateIsRunning: z.boolean(),
	PanelVersionName: z.string(),
	PanelBuildVersion: z.string(),
	NextPanelBuildVersion: z.string()
} );

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


export type SystemUsage = z.infer<typeof ZodUsageSchema>
export default mongoose.model<SystemUsage>( "usage", UsageSchema );
export {
	ZodUsageSchema,
	UsageSchema
};
