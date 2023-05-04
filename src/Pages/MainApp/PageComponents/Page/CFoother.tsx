import { FontAwesomeIcon }  from "@fortawesome/react-fontawesome";
import type { SystemUsage } from "@shared/Type/Systeminformation";
import { Link }             from "react-router-dom";

export default function CFoother( Props : { SystemUsage : SystemUsage } ) {
	return (
		<>
			<div className="bottom-0">
				<footer className="d-flex flex-wrap justify-content-between align-items-center p-3 my-0 border-top">
					<p className="col-md-4 mb-0 text-body-secondary">©2023{ new Date().getFullYear() !== 2023 && `-${ new Date().getFullYear() }` } Kaufmann,
						Oliver @ Kyrium.space</p>

					<a href="/"
					   className="col-md-4 d-flex align-items-center justify-content-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
						<img src="/img/logo/logo.png" alt="Logo" className="w-10"/>
					</a>

					<ul className="nav col-md-4 justify-content-end">
						<li className="nav-item">
							<Link to={ "/version/" + Props.SystemUsage.PanelVersionName }
							      className="nav-link px-2 text-body-secondary">
								{ Props.SystemUsage.PanelVersionName }
								<FontAwesomeIcon size={ "lg" } icon={ "book" } className={ "ms-3" }/>
							</Link>
						</li>

						<li className="nav-item">
							<Link to={ "https://getbootstrap.com/" } target="_blank"
							      className="nav-link px-2 text-body-secondary">
								<FontAwesomeIcon size={ "lg" }
								                 icon={ [ "fab", "bootstrap" ] }/>
							</Link>
						</li>

						<li className="nav-item">
							<Link to={ "https://github.com/Kyri123/ArkLin2.0/issues" } target="_blank"
							      className="nav-link px-2 text-body-secondary">
								<FontAwesomeIcon size={ "lg" }
								                 icon={ "bug" }/>
							</Link>
						</li>

						<li className="nav-item">
							<Link to={ "https://github.com/Kyri123/ArkLin2.0" } target="_blank"
							      className="nav-link px-2 text-body-secondary">
								<FontAwesomeIcon size={ "lg" }
								                 icon={ [ "fab", "github-square" ] }/>
							</Link>
						</li>

						<li className="nav-item">
							<Link to={ "https://discord.gg/gzhpjP2CMY" } target="_blank"
							      className="nav-link px-2 text-body-secondary">
								<FontAwesomeIcon size={ "lg" }
								                 icon={ [ "fab", "discord" ] }/>
							</Link>
						</li>
					</ul>
				</footer>
			</div>
		</>
	);
}
