/** @format */

import { FontAwesomeIcon }        from "@fortawesome/react-fontawesome";
import {
	Col,
	Modal,
	Row
}                                 from "react-bootstrap";
import {
	Link,
	Outlet
}                                 from "react-router-dom";
import { Ribbon }                 from "@comp/Elements/Ribbon";
import type { FunctionComponent } from "react";


const Component: FunctionComponent = () => (
	<div className="register-page bg-image"
		style={ {
			backgroundImage: "url('/img/backgrounds/bg.jpg')",
			backgroundSize: "cover",
			backgroundColor: "rgba(11, 19, 26, 1)",
			backgroundPosition: "center",
			backgroundRepeat: "no-repeat",
			height: "100%",
			width: "100%"
		} }>
		<Modal onHide={ () => {
		} }
		show={ true }
		centered
		backdrop={ false }
		contentClassName="rounded-4">
			<Modal.Header className="p-3 pb-2 border-bottom-0">
				<h1 className="fw-bold mb-0 fs-2 p-2 text-center w-100">
						KAdmin ArkLin 2.0
				</h1>
				<Ribbon>Alpha</Ribbon>
			</Modal.Header>
			<Modal.Body className="p-3 pt-0">

				<Outlet />
				<Row>
					<Col span={ 6 }>
						<Link to="https://discord.gg/uXxsqXD"
							target="_blank"
							className="btn btn-dark w-100 mb-2 rounded-3">
							<FontAwesomeIcon icon={ [ "fab", "discord" ] }
								className="pe-2" />
								Discord
						</Link>
					</Col>
					<Col span={ 6 }>
						<Link to="https://github.com/Kyri123/ArkLin2.0/"
							target="_blank"
							className="btn btn-dark w-100 mb-2 rounded-3">
							<FontAwesomeIcon icon={ [ "fab", "github" ] }
								className="pe-2" />
								Github
						</Link>
					</Col>
				</Row>
			</Modal.Body>
		</Modal>
	</div>
);

export { Component };
