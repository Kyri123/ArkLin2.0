import MongoInstances from "@/server/src/MongoDB/MongoInstances";
import type { MongoBase } from "@app/Types/MongoDB";
import * as mongoose from "mongoose";
import { z } from "zod";


const zodClusterSchema = z.object( {
	Instances: z.array( z.string() ),
	SyncInis: z.array( z.string() ),
	SyncSettings: z.array( z.string() ),
	Master: z.string(),
	DisplayName: z.string(),
	NoTributeDownloads: z.boolean(),
	NoTransferFromFiltering: z.boolean(),
	PreventDownloadDinos: z.boolean(),
	PreventDownloadItems: z.boolean(),
	PreventDownloadSurvivors: z.boolean(),
	PreventUploadDinos: z.boolean(),
	PreventUploadItems: z.boolean(),
	PreventUploadSurvivors: z.boolean()
} );

const clusterSchema = new mongoose.Schema( {
	Instances: { type: [ String ], ref: 'instances', required: true },
	SyncInis: { type: [ String ], required: true },
	SyncSettings: { type: [ String ], required: true },
	Master: { type: String, ref: 'instances', required: true },
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

clusterSchema.post( 'save', doc => {
	MongoInstances.updateMany( { Instance: doc.Instances }, { cluster: doc._id } );
} );

export type Cluster = z.infer<typeof zodClusterSchema> & MongoBase;

export default mongoose.model<Cluster>( "kadmin_cluster", clusterSchema );
export {
	clusterSchema, zodClusterSchema
};

