import { JobTask }               from "../TaskManager";
import {
	ConfigManager,
	SSHManager
}                                from "../../Lib/ConfigManager.Lib";
import { Octokit }               from "octokit";
import DB_GithubBranches         from "../../MongoDB/DB_GithubBranches";
import {
	IGithubBranche,
	IGithubReleases
}                                from "../../../../src/Shared/Api/github";
import DB_GithubReleases         from "../../MongoDB/DB_GithubReleases";
import process                   from "process";
import { IDashboard_BaseConfig } from "../../Types/Config";

const octokit = new Octokit( {
	auth: ConfigManager.GetDashboardConifg.PANEL_GithubToken,
	userAgent: "ArkLin2.0"
} );

export default new JobTask(
	ConfigManager.GetTaskConfig.GithubQueryInterval,
	"Github",
	async() => {
		SystemLib.DebugLog(
			"[TASKS] Running Task",
			SystemLib.ToBashColor( "Red" ),
			"Github"
		);

		try {
			const Releases = await octokit.request(
				"GET /repos/{owner}/{repo}/releases",
				{
					owner: "kyri123",
					repo: "ArkLin2.0",
					headers: {
						"X-GitHub-Api-Version": "2022-11-28"
					}
				}
			);

			const Branches = await octokit.request(
				"GET /repos/{owner}/{repo}/branches",
				{
					owner: "kyri123",
					repo: "ArkLin2.0",
					headers: {
						"X-GitHub-Api-Version": "2022-11-28"
					}
				}
			);

			if ( Branches.data.length > 0 ) {
				await DB_GithubBranches.deleteMany( {} );
				await DB_GithubBranches.create(
					Branches.data.map<IGithubBranche>( ( E ) => ( {
						name: E.name,
						sha: E.commit?.sha || "",
						url: E.commit?.url || "",
						protected: E.protected
					} ) )
				);
			}

			if ( Releases.data.length > 0 ) {
				await DB_GithubReleases.deleteMany( {} );
				await DB_GithubReleases.create(
					Releases.data.map<IGithubReleases>( ( E ) => ( {
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
						url: E.url
					} ) )
				);

				if ( global.__PANNELUPDATE ) {
					return;
				}

				//------------------------------------------------------------------
				//--------------------   Commit based Update   ---------------------
				//------------------------------------------------------------------
				const SHUpdateFile = "~/KAdmin/ArkLin2.0/sh/start.sh";
				let Branch = ConfigManager.GetDashboardConifg.PANEL_Branch;

				if ( ConfigManager.GetDashboardConifg.PANEL_UseCommitAsUpdateIndicator ) {
					const CurrentBranch = await DB_GithubBranches.findOne( { name: Branch } );
					let Sha : string | undefined = undefined;
					if ( !CurrentBranch ) {
						ConfigManager.Write<IDashboard_BaseConfig>( "Dashboard_BaseConfig", {
							...ConfigManager.GetDashboardConifg,
							PANEL_Branch: "main"
						} );
						Branch = "main";
					}
					else {
						Sha = CurrentBranch.sha;
					}

					const Commits = await octokit.request( "GET /repos/{owner}/{repo}/commits", {
						owner: "kyri123",
						repo: "ArkLin2.0",
						headers: {
							"X-GitHub-Api-Version": "2022-11-28"
						},
						sha: Sha || Branch
					} );

					const CurrentHash = ConfigManager.GetGitHash;
					if ( CurrentHash ) {
						const FoundedCommit = Commits.data.find( ( E ) => E.sha.replace( " ", "" ).trim() === CurrentHash.replace( " ", "" ).trim() )
						if ( !FoundedCommit ) {
							global.__PANNELUPDATE = true;
						}
						else {
							const FoundNewerCommit = Commits.data.find( ( E ) => new Date( E.commit.committer?.date || 0 ) > new Date( FoundedCommit.commit.committer?.date || 0 ) )
							if ( FoundNewerCommit ) {
								global.__PANNELUPDATE = true;
							}
						}
					}
				}

				//-------------------------------------------------------------------
				//--------------------   Release based Update   ---------------------
				//-------------------------------------------------------------------
				// We try to find the current branch data if they not exist skip any update.
				const Current = Releases.data.find(
					( E ) => E.tag_name === process.env.npm_package_version
				);
				if ( Current && ConfigManager.GetDashboardConifg.PANEL_UseCommitAsUpdateIndicator ) {
					// try to find a newer version
					const TestNext = Releases.data.find( ( E ) => new Date( E.created_at ).valueOf() > new Date( Current!.created_at ).valueOf() );
					if ( TestNext ) {
						global.__PANNELUPDATE = true;
					}
				}

				//-------------------------------------------------------------------
				//-------------   Set Release and mb trigger Update   ---------------
				//-------------------------------------------------------------------
				if ( global.__PANNELUPDATE ) {
					SystemLib.LogWarning( "[UPDATE] new update!" );

					if ( !ConfigManager.GetDashboardConifg.PANEL_AutomaticUpdate ) {
						SystemLib.LogWarning( "[UPDATE] Auto Update is disabled and will no trigger!" )
						return;
					}
					// Start to running the update script. by using screen
					SSHManager.ExecCommandInScreen(
						"ArkLinUpdate",
						`${ SHUpdateFile } ${ Branch }`
					).then( () => {
					} );
					return;
				}
			}
		}
		catch ( e ) {
			SystemLib.LogWarning( "[Github] Failed to Query:", ( e as Error ).message );
		}
	}
);
