import { useLocation } from "react-router-dom";
import type { FC }     from "react";
import { Card }        from "react-bootstrap";
import StringMapLib    from "../../Lib/StringMap.Lib";
import AccountSettings from "@page/app/pageComponents/me/AccountSettings";

const Component : FC = () => {
	const Location = useLocation();

	return (
		<Card>
			<Card.Header className="d-flex p-0">
				<h3 className="card-title p-3">
					{ StringMapLib.SubNav( Location.pathname.split( "/" ).pop() as string ) }
				</h3>
			</Card.Header>
			<AccountSettings/>
		</Card>
	);
};

export { Component };
