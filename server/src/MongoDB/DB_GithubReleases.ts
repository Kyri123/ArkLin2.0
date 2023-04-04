import * as mongoose              from "mongoose";
import { Plugin_MongoDB_findOne } from "../Lib/CrashSafe.Lib";
import { IGithubBranche }         from "../../../src/Shared/Api/github";

const Schema = new mongoose.Schema<IGithubBranche>( {}, { strict: true } );

Plugin_MongoDB_findOne( Schema );

export default mongoose.model<IGithubBranche>( "github_releases", Schema );