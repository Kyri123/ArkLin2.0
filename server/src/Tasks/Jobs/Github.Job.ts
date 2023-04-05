import { JobTask } from "../TaskManager";
import { ConfigManager, SSHManager } from "../../Lib/ConfigManager.Lib";
import { Octokit } from "octokit";
import DB_GithubBranches from "../../MongoDB/DB_GithubBranches";
import {
  IGithubBranche,
  IGithubReleases,
} from "../../../../src/Shared/Api/github";
import DB_GithubReleases from "../../MongoDB/DB_GithubReleases";

const octokit = new Octokit({
  userAgent: "ArkLin2.0",
});

export default new JobTask(
  ConfigManager.GetTaskConfig.GithubQueryInterval,
  "Github",
  async () => {
    SystemLib.DebugLog(
      "[TASKS] Running Task",
      SystemLib.ToBashColor("Red"),
      "Github"
    );

    try {
      const Releases = await octokit.request(
        "GET /repos/{owner}/{repo}/releases",
        {
          owner: "kyri123",
          repo: "ArkLin2.0",
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      const Branches = await octokit.request(
        "GET /repos/{owner}/{repo}/branches",
        {
          owner: "kyri123",
          repo: "ArkLin2.0",
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      if (Branches.data.length > 0) {
        await DB_GithubBranches.deleteMany({});
        await DB_GithubBranches.create(
          Branches.data.map<IGithubBranche>((E) => ({
            name: E.name,
            sha: E.commit?.sha || "",
            url: E.commit?.url || "",
            protected: E.protected,
          }))
        );
      }

      if (Releases.data.length > 0) {
        await DB_GithubReleases.deleteMany({});
        await DB_GithubReleases.create(
          Releases.data.map<IGithubReleases>((E) => ({
            assets_url: E.assets_url,
            body: E.body!,
            created_at: E.created_at,
            draft: E.draft,
            html_url: E.html_url,
            id: E.id,
            name: E.name!,
            node_id: E.node_id,
            prerelease: E.prerelease,
            published_at: E.published_at!,
            tag_name: E.tag_name,
            target_commitish: E.target_commitish,
            upload_url: E.upload_url,
            url: E.url,
          }))
        );

        const SHUpdateFile = "~/KAdmin/ArkLin2.0/sh/start.sh";
        const Branch = ConfigManager.GetDashboardConifg.PANEL_Branch;

        global.__PANNELUPDATE = false;
        const Current = Releases.data.find(
          (E) => E.tag_name === process.env.npm_package_version
        );
        if (Current) {
          const TestNext = Releases.data.find((E) => E.id > Current.id);
          if (TestNext) {
            global.__PANNELUPDATE = true;
            SystemLib.LogWarning("[UPDATE] new update:" + TestNext.tag_name);
            SSHManager.ExecCommandInScreen(
              "ArkLinUpdate",
              `${SHUpdateFile} ${Branch}`
            ).then(() => {});
          }
        }
      }
    } catch (e) {
      SystemLib.LogWarning("[Github] Failed to Query:", (e as Error).message);
    }
  }
);
