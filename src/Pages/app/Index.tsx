import type { FC }               from "react";
import { Table }                 from "react-bootstrap";
import {
	Link,
	useLoaderData
}                                from "react-router-dom";
import { FontAwesomeIcon }       from "@fortawesome/react-fontawesome";
import type { IndexLoaderProps } from "@page/app/loader";

const Component : FC = () => {
	const { changelogs } = useLoaderData() as IndexLoaderProps;

	return (
		<>
			<Table striped bordered hover>
				<thead>
				<tr>
					<th>Version</th>
					<td align="center" style={ { width: 0 } }>
						<b>Tag</b>
					</td>
					<td align="center" style={ { width: 200 } }>
						<b>Datum</b>
					</td>
					<td align="center" style={ { width: 150 } }>
						<b>Links</b>
					</td>
				</tr>
				</thead>
				<tbody>
				{ changelogs.map( ( Row, Index ) => (
					<tr key={ "VERSION" + Index }>
						<td>{ Row.name }</td>
						<td align="center">{ Row.tag_name }</td>
						<td align="center">
							{ new Date( Row.created_at ).toLocaleString() }
						</td>
						<td align="center">
							<Link to={ "/version/" + Row.tag_name }
							      className={ "text-neutral-900 hover:text-neutral-700" }>
								<FontAwesomeIcon size="xl" icon={ "book" }/>
							</Link>
							<Link target="_blank" to={ Row.html_url }
							      className={ "ps-2 text-neutral-900 hover:text-neutral-700" }>
								<FontAwesomeIcon size="xl" icon={ [ "fab", "github-square" ] }/>
							</Link>
						</td>
					</tr>
				) ) }
				</tbody>
			</Table>
		</>
	);
};

export { Component };
