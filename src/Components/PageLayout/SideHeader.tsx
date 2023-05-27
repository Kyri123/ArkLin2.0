import type React from "react";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import StringMapLib from "../../Lib/StringMap.Lib";


const SideHeader: React.FunctionComponent = () => {
	const { pathname } = useLocation();

	const namedPath = useMemo( () => {
		const path = pathname.split( "/" );
		path.shift();
		return path;
	}, [ pathname ] );

	return (
		<div className="container-fluid py-3 px-4 bg-light border-bottom">
			<div className="row m-0">
				<div className="col-sm-6 p-0">
					<h4 className="m-0">
						{ StringMapLib.nav( namedPath[ namedPath.length - 1 ] ) }
					</h4>
				</div>
				<div className="col-sm-6 align-middle p-0">
					<ol className="breadcrumb align-middle float-sm-end m-0">
						{ namedPath.map( V => (
							<li className="breadcrumb-item" key={ V }>
								{ StringMapLib.nav( V ) }
							</li>
						) ) }
					</ol>
				</div>
			</div>
		</div>
	);
};

export default SideHeader;
