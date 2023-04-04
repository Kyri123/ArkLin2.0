import {
	useEffect,
	useState
}                          from "react";
import { IGitlabRelease }  from "../../Shared/Type/Gitlab.Release";
import { API_QueryLib }    from "../../Lib/Api/API_Query.Lib";
import { Table }           from "react-bootstrap";
import { Link }            from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EChangelogUrl }   from "../../Shared/Enum/Routing";

export default function PHome() {
	const [ Data, setData ] = useState<IGitlabRelease[]>( [] );

	useEffect( () => {
		// get Data from API
		API_QueryLib.GetFromAPI<IGitlabRelease[]>( EChangelogUrl.get )
			.then( Response => {
				if ( Response.Data ) {
					setData( Response.Data );
				}
			} )
	}, [] );

	return (
		<>
			<Table striped bordered hover>
				<thead>
				<tr>
					<th>Version</th>
					<td align="center" style={ { width: 200 } }><b>Datum</b></td>
					<td align="center" style={ { width: 150 } }><b>Links</b></td>
				</tr>
				</thead>
				<tbody>
				{ Data.map( ( Row, Index ) => (
					<tr key={ "VERSION" + Index }>
						<td>{ Row.name }</td>
						<td align="center">{ new Date( Row.released_at ).toLocaleString() }</td>
						<td align="center">
							<Link to={ "/changelog/" + Row.name }><FontAwesomeIcon size="xl" icon={ "book" }/></Link>
							<Link target="_blank" className="ps-2" to={ Row._links.self }><FontAwesomeIcon size="xl"
																										   icon={ [ "fab", "gitlab-square" ] }/></Link>
							<Link target="_blank" className="ps-2" to={ Row.assets.sources[ 0 ].url }><FontAwesomeIcon
								size="xl" icon={ "download" }/></Link>
						</td>
					</tr>
				) ) }
				</tbody>
			</Table>
		</>
	);
}