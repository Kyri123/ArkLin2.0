import * as mongoose              from "mongoose";
import { IMO_Usage }              from "../../../src/Types/MongoDB";
import { Plugin_MongoDB_findOne } from "../Lib/CrashSafe.Lib";

const Schema = new mongoose.Schema<IMO_Usage>( {
	CPU: { type: Number, required: true },
	MemMax: { type: Number, required: true },
	MemUsed: { type: Number, required: true },
	DiskMax: { type: Number, required: true },
	DiskUsed: { type: Number, required: true },
	PanelNeedUpdate: { type: Boolean, required: true },
	PanelVersionName: { type: String, required: true },
	PanelBuildVersion: { type: String, required: true },
	NextPanelBuildVersion: { type: String }
} );

Plugin_MongoDB_findOne( Schema );

export default mongoose.model<IMO_Usage>( "usage", Schema );
