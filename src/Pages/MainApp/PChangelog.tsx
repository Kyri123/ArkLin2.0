import {
	useEffect,
	useState
}                                                 from "react";
import {
	Link,
	Navigate,
	useParams
}                                                 from "react-router-dom";
import { FontAwesomeIcon }                        from "@fortawesome/react-fontawesome";
import ReactMarkdown                              from "react-markdown";
import { API_QueryLib }                           from "../../Lib/Api/API_Query.Lib";
import { EChangelogUrl }                          from "../../Shared/Enum/Routing";
import type { GithubReleases }                    from "../../Shared/Type/github";
import type { TResponse_Changelog_GetChangelogs } from "../../Shared/Type/API_Response";

export default function PChangelog() : JSX.Element {
	const { version } = useParams();
	const [ Data, setData ] = useState<GithubReleases[]>( [] );
	const [ Selected, setSelected ] = useState<GithubReleases | undefined>(
		undefined
	);
	const [ LoadFromAPI, setLoadFromAPI ] = useState( true );

	useEffect( () => {
		// get Data from API
		API_QueryLib.GetFromAPI<TResponse_Changelog_GetChangelogs>( EChangelogUrl.get ).then( ( Response ) => {
			if ( Response.Data ) {
				setData( Response.Data );
				const Selected = Response.Data.find( ( e ) => e.tag_name === version );
				if ( Selected ) {
					setSelected( Selected );
				}
				setLoadFromAPI( false );
			}
		} );
	}, [ version ] );

	if ( LoadFromAPI ) {
		return <></>;
	}

	if ( !Selected ) {
		return <Navigate to="/home/404"/>;
	}

	return (
		<div className="card card-default">
			<div className="card-header d-flex p-0">
				<h3 className="card-title p-3 flex-fill">
					<FontAwesomeIcon icon={ "book" } size="lg" className="pe-2"/>
					{ Selected.name }
				</h3>
				<ul className="nav nav-pills ml-auto p-2">
					<li className="nav-item dropdown">
            <span
	            className="nav-link dropdown-toggle"
	            data-bs-toggle="dropdown"
	            aria-expanded="false"
            >
              { Selected.tag_name } <span className="caret"></span>
            </span>
						<div
							className="dropdown-menu dropdown-menu-right"
							data-boundary="scrollParent"
						>
							{ Data.map( ( V, I ) => (
								<Link
									to={ "/version/" + V.tag_name }
									className={ `dropdown-item ${
										V.tag_name === version ? "active" : ""
									}` }
									key={ "CHANGELOGSEL" + I }
								>
									{ V.name }
								</Link>
							) ) }
						</div>
					</li>
				</ul>
			</div>

			<div className="card-body p-3 pb-0">
				<ReactMarkdown>{ Selected.body }</ReactMarkdown>
			</div>

			<div className="card-footer pb-0">
				<ReactMarkdown>
					{ new Date( Selected.created_at ).toLocaleString() }
				</ReactMarkdown>
			</div>
		</div>
	);
}
