import type { InstanceData } from "@app/Types/ArkSE";
import type { MongoBase } from "@app/Types/MongoDB";
import type { Cluster } from "@server/MongoDB/MongoCluster";
import { EServerState } from "@shared/Enum/EServerState";
import * as mongoose from "mongoose";
import { z } from "zod";


const zodInstanceSchema = z.object( {
	Instance: z.string(),
	LastAutoBackup: z.number(),
	LastAutoUpdate: z.number(),
	ArkmanagerCfg: z.any(),
	State: z.object( {
		allConfigs: z.array( z.string() ),
		State: z.nativeEnum( EServerState ),
		IsListen: z.boolean(),
		Player: z.number(),
		OnlinePlayerList: z.array( z.any() ),
		ServerVersion: z.string(),
		ArkmanagerPID: z.number(),
		ArkserverPID: z.number()
	} ),
	PanelConfig: z.object( {
		BackupEnabled: z.boolean(),
		MaxBackupfolderSize: z.number(),
		BackupInterval: z.number(),
		AutoUpdateParameters: z.array( z.string() ),
		AutoUpdateEnabled: z.boolean(),
		AutoUpdateInterval: z.number()
	} ),
	ServerMap: z.object( {
		BG: z.string(),
		LOGO: z.string()
	} )
} );

const instanceSchema = new mongoose.Schema( {
	Instance: { type: String, required: true, unique: true },
	LastAutoBackup: { type: Number, required: false },
	LastAutoUpdate: { type: Number, required: false },

	ArkmanagerCfg: {
		type: mongoose.Schema.Types.Mixed,
		required: true
	},

	State: {
		type: {
			allConfigs: { type: [ String ], required: false },
			State: { type: String, required: true },
			IsListen: { type: Boolean, required: true },
			Player: { type: Number },
			OnlinePlayerList: { type: [] },
			ServerVersion: { type: String },
			ArkmanagerPID: { type: Number, required: true },
			ArkserverPID: { type: Number, required: true }
		},
		required: true
	},

	PanelConfig: {
		type: {
			BackupEnabled: { type: Boolean, required: true },
			MaxBackupfolderSize: { type: Number, required: true },
			BackupInterval: { type: Number, required: true },
			AutoUpdateParameters: { type: [ String ], required: true },
			AutoUpdateEnabled: { type: Boolean, required: true },
			AutoUpdateInterval: { type: Number, required: true }
		},
		required: true
	},

	ServerMap: {
		type: {
			BG: { type: String, required: true },
			LOGO: { type: String, required: true }
		},
		required: false,
		default: { BG: "", LOGO: "" }
	},

	cluster: { type: [ mongoose.Schema.Types.ObjectId ], ref: 'kadmin_cluster', required: false }
} );

export interface InstanceInterface extends z.infer<typeof zodInstanceSchema> {
	ArkmanagerCfg: InstanceData & Record<string, any>
}

export type InstanceWithClusterId = InstanceInterface & MongoBase & {
	cluster?: string
};

export type Instance = InstanceInterface & MongoBase & {
	cluster?: Cluster
};

export default mongoose.model<InstanceInterface>( "instances", instanceSchema );
