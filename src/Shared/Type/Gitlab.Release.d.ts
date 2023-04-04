export interface IGitlabRelease {

	Author : {
		id : number;
		username : string;
		name : string;
		state : string;
		avatar_url : string;
		web_url : string;
	},

	Trailers : any,

	Commit : {
		id : string;
		short_id : string;
		created_at : Date;
		parent_ids : string[];
		title : string;
		message : string;
		author_name : string;
		author_email : string;
		authored_date : Date;
		committer_name : string;
		committer_email : string;
		committed_date : Date;
		trailers : Trailers;
		web_url : string;
	},

	Source : {
		format : string;
		url : string;
	},

	Link : {
		id : number;
		name : string;
		url : string;
		direct_asset_url : string;
		external : boolean;
		link_type : string;
	},

	Assets : {
		count : number;
		sources : Source[];
		links : Link[];
	},

	Evidence : {
		sha : string;
		filepath : string;
		collected_at : Date;
	},

	Links : {
		closed_issues_url : string;
		closed_merge_requests_url : string;
		merged_merge_requests_url : string;
		opened_issues_url : string;
		opened_merge_requests_url : string;
		self : string;
	},

	name : string;
	tag_name : string;
	description : string;
	created_at : Date;
	released_at : Date;
	upcoming_release : boolean;
	author : Author;
	commit : Commit;
	commit_path : string;
	tag_path : string;
	assets : Assets;
	evidences : Evidence[];
	_links : Links;
}