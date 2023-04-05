import * as mongoose from "mongoose";
import { IMO_AccountKeys } from "../../../src/Shared/Api/MariaDB";
import { Plugin_MongoDB_findOne } from "../Lib/CrashSafe.Lib";

const Schema = new mongoose.Schema<IMO_AccountKeys>({
  key: { type: String, unique: true, index: true, require: true },
  AsSuperAdmin: { type: Boolean, default: false, require: true },
});

Plugin_MongoDB_findOne(Schema);

export default mongoose.model("accountkey", Schema);
