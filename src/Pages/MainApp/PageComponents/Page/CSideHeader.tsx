import React, { useMemo } from "react";
import StringMapLib       from "../../../../Lib/StringMap.Lib";
import { useLocation }    from "react-router-dom";

const CSideHeader : React.FunctionComponent = () => {
	const { pathname } = useLocation();

	const Pathname = useMemo( () => {
		const Path = pathname.split( "/" );
		Path.shift();
		return Path;
	}, [ pathname ] );

	return (
		<div className="container-fluid py-3 px-4 bg-light border-bottom">
			<div className="row m-0">
				<div className="col-sm-6 p-0">
					<h4 className="m-0">
						{ StringMapLib.Nav( Pathname[ Pathname.length - 1 ] ) }
					</h4>
				</div>
				<div className="col-sm-6 align-middle p-0">
					<ol className="breadcrumb align-middle float-sm-end m-0">
						{ Pathname.map( ( V ) => (
							<li className="breadcrumb-item" key={ V }>
								{ StringMapLib.Nav( V ) }
							</li>
						) ) }
					</ol>
				</div>
			</div>
		</div>
	);
};

export default CSideHeader;
