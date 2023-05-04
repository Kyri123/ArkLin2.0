import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link }            from "react-router-dom";
import type { FC }              from "react";

const Component : FC = () => {
	return (
		<div className="error-page pt-5 mt-5">
			<h2 className="headline text-danger"> 403</h2>
			<div className="error-content">
				<h3 className="text-danger">
					<b>
						<FontAwesomeIcon icon="triangle-exclamation"/> OH NEIN! Das darfst
						du nicht!
					</b>
				</h3>
				<p>
					Leider hat dir der böse Administrator hierzu keine Berechtigung
					erteilt! Es tut mir wirklich leid... <br/>
					Gehe am besten zurück zur <Link to="/home">Startseite</Link>
				</p>
			</div>
		</div>
	);
}

export { Component }