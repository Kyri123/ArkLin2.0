import type { FC }                   from "react";
import {
	useLoaderData,
	useParams
}                               from "react-router-dom";
import { FontAwesomeIcon }      from "@fortawesome/react-fontawesome";
import ReactMarkdown            from "react-markdown";
import type { ChangelogLoaderProps } from "@page/app/loader/[changelogTag]";

const Component : FC = () => {
	const { version } = useParams();
	const { changelog } = useLoaderData() as ChangelogLoaderProps;

	return (
		<div className="card card-default">
			<div className="card-header d-flex p-0">
				<h3 className="card-title p-3 flex-fill">
					<FontAwesomeIcon icon={ "book" } size="lg" className="pe-2"/>
					{ changelog.name }
				</h3>
			</div>

			<div className="card-body p-3 pb-0">
				<ReactMarkdown>{ changelog.body }</ReactMarkdown>
			</div>

			<div className="card-footer pb-0">
				<ReactMarkdown>
					{ new Date( changelog.created_at ).toLocaleString() }
				</ReactMarkdown>
			</div>
		</div>
	);
};

export { Component };
