import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ISystemUsage } from "../../../Shared/Type/Systeminformation";
import { Link } from "react-router-dom";

export default function CFoother(Props: { SystemUsage: ISystemUsage }) {
  return (
    <footer className="main-footer fixed">
      <br className="d-block d-sm-none" />
      <Link
        className="float-right"
        to={"/changelog/" + Props.SystemUsage.PanelVersionName}
      >
        Version: {Props.SystemUsage.PanelVersionName}
      </Link>
      <strong>
        Framework by{" "}
        <Link target="_blank" to="https://adminlte.io">
          AdminLTE.io
        </Link>{" "}
        | (c) by Kyri123
        <Link className="ps-1" target="_blank" to="https://github.com/Kyri123">
          <FontAwesomeIcon size={"lg"} icon={["fab", "github-square"]} />
        </Link>
        <Link
          className="ps-1"
          target="_blank"
          to="https://git.kyrium.space/kyrium"
        >
          <FontAwesomeIcon size={"lg"} icon={["fab", "gitlab-square"]} />
        </Link>
      </strong>
    </footer>
  );
}
