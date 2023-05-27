import { EBashScript } from "@/server/src/Enum/EBashScript";
import { configManager, getCurrentBranch, sshManager } from "@/server/src/Lib/configManager.Lib";
import { BC } from "@/server/src/Lib/system.Lib";
import type { GithubBranch } from "@/server/src/MongoDB/MongoGithubBranches";
import MongoGithubBranches from "@/server/src/MongoDB/MongoGithubBranches";
import type { GithubRelease } from "@/server/src/MongoDB/MongoGithubReleases";
import MongoGithubReleases from "@/server/src/MongoDB/MongoGithubReleases";
import { JobTask } from "@/server/src/Tasks/taskManager";
import { Octokit } from "octokit";



const octokit = new Octokit( {
	auth: configManager.getDashboardConfig.PANEL_GithubToken,
	userAgent: "ArkLin2.0"
} );

export default new JobTask(
	configManager.getTaskConfig.GithubQueryInterval,
	"Github",
	async() => {
		SystemLib.debugLog(
			"TASKS", "Running Task",
			BC( "Red" ),
			"Github"
		);

		try {
			const releases = await octokit.request(
				"GET /repos/{owner}/{repo}/releases",
				{
					owner: "kyri123",
					repo: "ArkLin2.0",
					headers: {
						"X-GitHub-Api-Version": "2022-11-28"
					}
				}
			);

			const branches = await octokit.request(
				"GET /repos/{owner}/{repo}/branches",
				{
					owner: "kyri123",
					repo: "ArkLin2.0",
					headers: {
						"X-GitHub-Api-Version": "2022-11-28"
					}
				}
			);

			if( branches.data.length > 0 ) {
				await MongoGithubBranches.deleteMany( {} );
				await MongoGithubBranches.create(
					branches.data.map<GithubBranch>( E => ( {
						name: E.name,
						sha: E.commit?.sha || "",
						url: E.commit?.url || "",
						protected: E.protected
					} ) )
				);
			}

			if( releases.data.length > 0 ) {
				await MongoGithubReleases.deleteMany( {} );
				await MongoGithubReleases.create(
					releases.data.map<GithubRelease>( E => ( {
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

				if( global.PANELUPDATE ) {
					return;
				}

				//------------------------------------------------------------------
				//--------------------   Commit based Update   ---------------------
				//------------------------------------------------------------------
				const [ branch, sha ] = await getCurrentBranch();
				const currentHash = configManager.getGitHash;

				if( configManager.getDashboardConfig.PANEL_UseCommitAsUpdateIndicator && currentHash ) {
					const commits = await octokit.request( "GET /repos/{owner}/{repo}/commits", {
						owner: "kyri123",
						repo: "ArkLin2.0",
						headers: {
							"X-GitHub-Api-Version": "2022-11-28"
						},
						sha: sha || branch
					} );

					const foundedCommit = commits.data.find( E => E.sha.replace( " ", "" ).trim() === currentHash.replace( " ", "" ).trim() );
					if( !foundedCommit ) {
						global.PANELUPDATE = true;
					} else {
						const foundNewerCommit = commits.data.find( E => new Date( E.commit.committer?.date || 0 ) > new Date( foundedCommit.commit.committer?.date || 0 ) );
						if( foundNewerCommit ) {
							global.PANELUPDATE = true;
						}
					}
				} else if( currentHash ) {
					SystemLib.logError( "update", "currentHash is undefined... Is it a git repo?" );
				}

				//-------------------------------------------------------------------
				//--------------------   Release based Update   ---------------------
				//-------------------------------------------------------------------
				// We try to find the current branch data if they not exist skip any update.
				if( !configManager.getDashboardConfig.PANEL_UseCommitAsUpdateIndicator ) {
					const current = releases.data.find(
						E => E.tag_name === process.env.npm_package_version
					);
					if( current ) {
						// try to find a newer version
						const testNext = releases.data.find( E => new Date( E.created_at ).valueOf() > new Date( current!.created_at ).valueOf() );
						if( testNext ) {
							global.PANELUPDATE = true;
						}
					}
				}

				//-------------------------------------------------------------------
				//-------------   Set Release and mb trigger Update   ---------------
				//-------------------------------------------------------------------
				if( global.PANELUPDATE ) {
					SystemLib.logWarning( "UPDATE", "new update!" );

					if( !configManager.getDashboardConfig.PANEL_AutomaticUpdate ) {
						SystemLib.logWarning( "UPDATE", "Auto Update is disabled and will no trigger!" );
						return;
					}

					SystemLib.logWarning( "UPDATE", "Trigger Update:", `${ EBashScript.update } ${ branch }` );
					// Start to running the update script. by using screen
					sshManager.execCommandInScreen(
						"ArkLinUpdate",
						`${ EBashScript.update } "${ branch }"`
					).then( () => {
					} );
					return;
				}
			}
		} catch( e ) {
			SystemLib.logWarning( "Github", "Failed to Query:", ( e as Error ).message );
		}
	}
);
