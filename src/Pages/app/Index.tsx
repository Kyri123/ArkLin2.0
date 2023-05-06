import type { FC }               from "react";
import { useState }              from "react";
import { Button }                from "react-bootstrap";
import { useLoaderData }         from "react-router-dom";
import { FontAwesomeIcon }       from "@fortawesome/react-fontawesome";
import type { IndexLoaderProps } from "@page/app/loader";
import ReactMarkdown             from "react-markdown";

const Component : FC = () => {
	const { changelogs } = useLoaderData() as IndexLoaderProps;

	const [ showChangelog, setShowChangelog ] = useState( changelogs.at( 0 ) );

	return (
		<>
			<div className="flex">
				<ol className="relative list-unstyled border-l-4 border-r-0 border-2 border-gray-800 border-start">
					{ changelogs.map( ( Row ) => (
						<li className="ml-4" key={ "timeline" + Row._id }>
							<div
								className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
							<time
								className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500 text-center">{ new Date( Row.created_at ).toLocaleString() }
							</time>
							<Button onClick={ () => setShowChangelog( Row ) } className="block w-full mt-2"
							        variant="dark"
							        size="sm"
							        disabled={ Row._id === showChangelog?._id }>
								<h5 className="m-0 text-center">v.{ Row.tag_name }</h5>
							</Button>
							<hr/>
						</li>
					) ) }
				</ol>
				<div className="flex-1">
					{ !!showChangelog && <div className="card card-default ms-3">
						<div className="card-header d-flex p-0">
							<h3 className="card-title p-3 flex-fill">
								<FontAwesomeIcon icon={ "book" } size="lg" className="pe-2"/>
								Changelog: { showChangelog.name }
							</h3>
						</div>

						<div className="card-body p-3 pb-0">
							<ReactMarkdown>{ showChangelog.body }</ReactMarkdown>
						</div>

						<div className="card-footer pb-0">
							<ReactMarkdown>
								{ new Date( showChangelog.created_at ).toLocaleString() }
							</ReactMarkdown>
						</div>
					</div> }
				</div>
			</div>
		</>
	);
};

export { Component };
