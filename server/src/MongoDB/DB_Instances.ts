import * as mongoose      from "mongoose";
import type { MongoBase } from "../../../src/Types/MongoDB";
import type {
	InstanceData,
	InstanceState,
	PanelServerConfig
}                         from "@app/Types/ArkSE";

const InstanceSchema = new mongoose.Schema( {
	Instance: { type: String, required: true, unique: true },
	LastAutoBackup: { type: Number, required: false },
	LastAutoUpdate: { type: Number, required: false },

	ArkmanagerCfg: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		strict: false
	},

	State: {
		type: {
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
	}
} );


interface InstanceInterface extends mongoose.InferSchemaType<typeof InstanceSchema> {
	ArkmanagerCfg : InstanceData & Record<string, any>;
	State : InstanceState;
	PanelConfig : PanelServerConfig;
}

export type Instance = InstanceInterface & MongoBase

export default mongoose.model<Instance>( "instances", InstanceSchema );
