import * as mongoose              from "mongoose";
import { IGitlabRelease }         from "../../../src/Shared/Type/Gitlab.Release";
import { Plugin_MongoDB_findOne } from "../Lib/CrashSafe.Lib";

const Schema = new mongoose.Schema<IGitlabRelease>( {} );

Plugin_MongoDB_findOne( Schema );

export default mongoose.model<IGitlabRelease>( "gitlab_releases", Schema );