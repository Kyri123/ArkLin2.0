import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

export default function P404(): JSX.Element {
  return (
    <div className="error-page pt-5 mt-5">
      <h2 className="headline text-warning"> 404</h2>
      <div className="error-content">
        <h3 className="text-warning">
          <b>
            <FontAwesomeIcon icon="triangle-exclamation" /> OH NEIN! Seite wurde
            gefressen!
          </b>
        </h3>
        <p>
          Wir konnten die Seite die du aufrufen möchtest nicht finden... Gehe am
          besten zurück zur <Link to="/home">Startseite</Link>
        </p>
      </div>
    </div>
  );
}
