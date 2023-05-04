import * as mongoose from "mongoose";
import type { MongoBase } from "@app/Types/MongoDB";

const ClusterSchema = new mongoose.Schema( {
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


export type Cluster = mongoose.InferSchemaType<typeof ClusterSchema> & MongoBase
export default mongoose.model<Cluster>( "kadmin_cluster", ClusterSchema );
