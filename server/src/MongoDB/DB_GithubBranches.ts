import * as mongoose              from "mongoose";
import { Plugin_MongoDB_findOne } from "../Lib/CrashSafe.Lib";
import type { IGithubBranche }         from "../../../src/Shared/Type/github";

const Schema = new mongoose.Schema<IGithubBranche>( {
	name: { type: String, unique: true },
	url: { type: String },
	sha: { type: String },
	protected: { type: Boolean }
} );

Plugin_MongoDB_findOne( Schema );

export default mongoose.model<IGithubBranche>( "github_branches", Schema );
