import * as mongoose              from "mongoose";
import { IMO_Instance }           from "../../../src/Shared/Api/MongoDB";
import { Plugin_MongoDB_findOne } from "../Lib/CrashSafe.Lib";

const Schema = new mongoose.Schema<IMO_Instance>( {
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

Plugin_MongoDB_findOne( Schema );

export default mongoose.model<IMO_Instance>( "instances", Schema );
