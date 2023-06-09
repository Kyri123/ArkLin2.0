export interface GithubBranche {
	name : string;
	sha : string;
	url : string;
	protected : boolean;
}

export interface GithubReleases {
	url : string;
	assets_url : string;
	upload_url : string;
	html_url : string;
	id : number;
	node_id : string;
	tag_name : string;
	target_commitish : string;
	name : string;
	draft : boolean;
	prerelease : boolean;
	created_at : string;
	published_at : string;
	body : string;
}


export interface IGithubCommits {
	message : string;
	sha : string;
	branch : string;
	created_at : Date;
}
