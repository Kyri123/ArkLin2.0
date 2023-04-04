export interface IGithubBranche {
	name : string,
	sha : string,
	url : string,
	protected : boolean
}

export interface IGithubReleases {
	url : string,
	assets_url : string,
	upload_url : string,
	html_url : string,
	id : number,
	node_id : string,
	tag_name : string,
	target_commitish : string,
	name : string,
	draft : boolean,
	prerelease : boolean,
	created_at : string,
	published_at : string,
	body : string
}