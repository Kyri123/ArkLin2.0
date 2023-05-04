import {
	useEffect,
	useState
}                                                 from "react";
import { API_QueryLib }                           from "../../Lib/Api/API_Query.Lib";
import { Table }                                  from "react-bootstrap";
import { Link }                                   from "react-router-dom";
import { FontAwesomeIcon }                        from "@fortawesome/react-fontawesome";
import { EChangelogUrl }                          from "@shared/Enum/Routing";
import type { GithubReleases }                    from "@shared/Type/github";
import type { TResponse_Changelog_GetChangelogs } from "@shared/Type/API_Response";

export default function PHome() {
	const [ Data, setData ] = useState<GithubReleases[]>( [] );

	useEffect( () => {
		// get Data from API
		API_QueryLib.GetFromAPI<TResponse_Changelog_GetChangelogs>( EChangelogUrl.get ).then(
			( Response ) => {
				if ( Response.Data ) {
					setData( Response.Data );
				}
			}
		);
	}, [] );

	return (
		<>
			<Table striped bordered hover>
				<thead>
				<tr>
					<th>Version</th>
					<td align="center" style={ { width: 200 } }>
						<b>Datum</b>
					</td>
					<td align="center" style={ { width: 150 } }>
						<b>Links</b>
					</td>
				</tr>
				</thead>
				<tbody>
				{ Data.map( ( Row, Index ) => (
					<tr key={ "VERSION" + Index }>
						<td>{ Row.name }</td>
						<td align="center">
							{ new Date( Row.created_at ).toLocaleString() }
						</td>
						<td align="center">
							<Link to={ "/version/" + Row.tag_name }>
								<FontAwesomeIcon size="xl" icon={ "book" }/>
							</Link>
							<Link target="_blank" className="ps-2" to={ Row.html_url }>
								<FontAwesomeIcon size="xl" icon={ [ "fab", "github-square" ] }/>
							</Link>
						</td>
					</tr>
				) ) }
				</tbody>
			</Table>
		</>
	);
}
