import AccountSettings from "@page/app/pageComponents/me/AccountSettings";
import type { FC } from "react";
import { Card } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import StringMapLib from "../../Lib/StringMap.Lib";


const Component: FC = () => {
	const { pathname } = useLocation();

	return (
		<Card>
			<Card.Header className="d-flex p-0">
				<h3 className="card-title p-3">
					{ StringMapLib.subNav( pathname.split( "/" ).pop() as string ) }
				</h3>
			</Card.Header>
			<AccountSettings />
		</Card>
	);
};

export { Component };

