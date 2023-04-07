import * as mongoose              from "mongoose";
import { Plugin_MongoDB_findOne } from "../Lib/CrashSafe.Lib";
import { IMO_AccountKeys }        from "../../../src/Types/MongoDB";

const Schema = new mongoose.Schema<IMO_AccountKeys>( {
	key: { type: String, unique: true, index: true, require: true },
	AsSuperAdmin: { type: Boolean, default: false, require: true }
} );

Plugin_MongoDB_findOne( Schema );

export default mongoose.model( "accountkey", Schema );
