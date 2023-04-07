import * as mongoose              from "mongoose";
import { IMO_Cluster }            from "../../../src/Types/MongoDB";
import { Plugin_MongoDB_findOne } from "../Lib/CrashSafe.Lib";

const Schema = new mongoose.Schema<IMO_Cluster>( {
	Instances: { type: [ String ], required: true },
	SyncInis: { type: [ String ], required: true },
	SyncSettings: { type: [ String ], required: true },
	Master: { type: String, required: true },
	DisplayName: { type: String, required: true },
	NoTributeDownloads: { type: Boolean, required: true },
	NoTransferFromFiltering: { type: Boolean, required: true },
	PreventDownloadDinos: { type: Boolean, required: true },
	PreventDownloadItems: { type: Boolean, required: true },
	PreventDownloadSurvivors: { type: Boolean, required: true },
	PreventUploadDinos: { type: Boolean, required: true },
	PreventUploadItems: { type: Boolean, required: true },
	PreventUploadSurvivors: { type: Boolean, required: true }
} );

Plugin_MongoDB_findOne( Schema );

export default mongoose.model<IMO_Cluster>( "kadmin_cluster", Schema );
