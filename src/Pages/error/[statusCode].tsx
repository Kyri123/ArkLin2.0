import { Ribbon } from "@comp/Elements/Ribbon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAuth from "@hooks/useAuth";
import type { FC } from "react";
import {
	Col,
	Modal,
	Row
} from "react-bootstrap";
import {
	Link,
	useParams
} from "react-router-dom";


const Component: FC = () => {
	const { statusCode } = useParams();
	const { token } = useAuth();

	let errorTest = (
		<p className="text-xl">
			Leider wurde diese Seite von einem Dino gefressen...
		</p>
	);

	switch ( statusCode ) {
		case "401":
		case "403":
			errorTest = (
				<p className="text-xl">
					Leider hat dir der böse Administrator hierzu keine Berechtigung
					erteilt! Es tut mir wirklich leid...
				</p>
			);
			break;
	}

	return (
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
					<h1 className="fw-bold mb-0 fs-2 p-2 text-center w-100 text-danger">
						Error: { statusCode }
					</h1>
					<Ribbon>Alpha</Ribbon>
				</Modal.Header>
				<Modal.Body className="p-3 pt-0">
					{ errorTest }
					<Link className="d-block btn btn-dark mt-3"
					      to={ token !== "" ? "/app" : "/auth/login" }>Startseite</Link>
					<hr />
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
};

export { Component };

