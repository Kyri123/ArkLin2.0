import * as mongoose              from "mongoose";
import { IMO_Accounts }           from "../../../src/Shared/Api/MongoDB";
import { Plugin_MongoDB_findOne } from "../Lib/CrashSafe.Lib";

const Schema = new mongoose.Schema<IMO_Accounts>( {
	username: { type: String, unique: true, require: true },
	password: { type: String, require: true },
	mail: { type: String, unique: true, require: true },
	servers: { type: [ String ], default: [], require: true },
	permissions: { type: [ String ], default: [], require: true }
} );

Plugin_MongoDB_findOne( Schema );

export default mongoose.model<IMO_Accounts>( "accounts", Schema );
