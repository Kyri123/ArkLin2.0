/** @format */

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IStateCardProps } from "../../../Types/AdminLTE";

export function CStateCard( Props : IStateCardProps ) {
	if ( Props.Hide || ( Props.Permission !== undefined && !Props.Permission ) ) {
		return <></>;
	}

	return (
		<div className={ Props.className }>
			<div className="info-box">
        <span className={ `info-box-icon text-bg-${ Props.Color } shadow-sm` }>
          <FontAwesomeIcon icon={ Props.Icon } />
        </span>

				<div className="info-box-content">
					<span className="info-box-text">{ Props.Title }</span>
					<div
						className="progress mb-0 mt-1 me-2 rounded"
						style={ { height: 5 } }
					>
						<div
							className={ `progress-bar bg-${ Props.BarColor }` }
							style={ { width: `${ Props.BarPercent }%` } }
						></div>
					</div>
					<span className="info-box-number text-sm">{ Props.children }</span>
				</div>
			</div>
		</div>
	);
}
