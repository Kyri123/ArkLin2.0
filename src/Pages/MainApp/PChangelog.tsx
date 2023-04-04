import {
	useEffect,
	useState
}                          from "react";
import {
	Link,
	Navigate,
	useParams
}                          from 'react-router-dom';
import { IGitlabRelease }  from "../../Shared/Type/Gitlab.Release";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactMarkdown       from "react-markdown";
import { API_QueryLib }    from "../../Lib/Api/API_Query.Lib";
import { EChangelogUrl }   from "../../Shared/Enum/Routing";

export default function PChangelog() : JSX.Element {
	const { version } = useParams();
	const [ Data, setData ] = useState<IGitlabRelease[]>( [] );
	const [ Selected, setSelected ] = useState<IGitlabRelease>( {
		Assets: { count: 0, links: [], sources: [] },
		Author: { avatar_url: "", id: 0, name: "", state: "", username: "", web_url: "" },
		Commit: {
			author_email: "",
			author_name: "",
			authored_date: new Date(),
			committed_date: new Date(),
			committer_email: "",
			committer_name: "",
			created_at: new Date(),
			id: "",
			message: "",
			parent_ids: [],
			short_id: "",
			title: "",
			trailers: undefined,
			web_url: ""
		},
		Evidence: { collected_at: new Date(), filepath: "", sha: "" },
		Link: { direct_asset_url: "", external: false, id: 0, link_type: "", name: "", url: "" },
		Links: {
			closed_issues_url: "",
			closed_merge_requests_url: "",
			merged_merge_requests_url: "",
			opened_issues_url: "",
			opened_merge_requests_url: "",
			self: ""
		},
		Source: { format: "", url: "" },
		Trailers: {},
		_links: undefined,
		assets: undefined,
		author: undefined,
		commit: undefined,
		commit_path: "",
		created_at: new Date(),
		description: "Lade...",
		evidences: [],
		name: "Lade...",
		released_at: new Date(),
		tag_name: "",
		tag_path: "",
		upcoming_release: false
	} );

	useEffect( () => {
		// get Data from API
		API_QueryLib.GetFromAPI<IGitlabRelease[]>( EChangelogUrl.get )
			.then( Response => {
				if ( Response.Data ) {
					setData( Response.Data );
					const Selected = Response.Data.find( e => e.name === version );
					if ( Selected ) {
						setSelected( Selected );
					}
				}
			} )
	}, [ version ] );

	if ( version?.toLowerCase().includes( "latest" ) && Data.length > 0 ) {
		const Selected = Data.find( e => e.name.toLowerCase().includes( version?.split( "_" )[ 1 ] ) );
		if ( Selected ) {
			return <Navigate to={ "/changelog/" + Data[ 0 ].name }/>;
		}
		else {
			return <Navigate to="/home/404"/>;
		}
	}

	return (
		<div className="card card-default">
			<div className="card-header d-flex p-0">
				<h3 className="card-title p-3">
					<FontAwesomeIcon icon={ "book" } size="lg" className="pe-2"/>
					{ version }
				</h3>
				<ul className="nav nav-pills ml-auto p-2">
					<li className="nav-item dropdown">
							<span className="nav-link dropdown-toggle" data-toggle="dropdown"
								  aria-expanded="false">
								Dropdown <span className="caret"></span>
							</span>
						<div className="dropdown-menu dropdown-menu-right" data-boundary="scrollParent">
							{ ( Data.map( ( V, I ) => (
								<Link to={ "/changelog/" + V.name }
									  className={ `dropdown-item ${ V.name === version ? "active" : "" }` }
									  key={ "CHANGELOGSEL" + I }>{ V.name }</Link>
							) ) ) }
						</div>
					</li>
				</ul>
			</div>

			<div className="card-body p-3 pb-0">
				<ReactMarkdown>{ Selected.description }</ReactMarkdown>
			</div>

			<div className="card-footer pb-0">
				<ReactMarkdown>{ new Date( Selected.released_at ).toLocaleString() }</ReactMarkdown>
			</div>

		</div>
	);
}