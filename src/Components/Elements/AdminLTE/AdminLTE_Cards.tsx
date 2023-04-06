/** @format */

import { IStateCardProps }   from "../../../Types/AdminLTE";
import { Card }              from "react-bootstrap";
import { FunctionComponent } from "react";
import { FontAwesomeIcon }   from "@fortawesome/react-fontawesome";

export const CStateCard : FunctionComponent<IStateCardProps> = ( {
	Hide,
	Color,
	Permission,
	BarPercent,
	BarColor,
	Icon,
	Title,
	children,
	...Props
} ) => {
	if ( Hide || ( Permission !== undefined && !Permission ) ) {
		return <></>;
	}

	return (
		<>
			<Card { ...Props }>
				<div className={ "d-flex" }>
					<span className={ `text-bg-${ Color } flex-grow-0 p-4 rounded-tl rounded-bl` }>
			          <FontAwesomeIcon icon={ Icon } size={ "2x" }/>
			        </span>

					<div className="flex-fill p-3 py-2">
						<span className="info-box-text font-bold">{ Title }</span>
						<div
							className="progress rounded my-1 mt-2"
							style={ { height: 5 } }
						>
							<div
								className={ `progress-bar bg-${ BarColor }` }
								style={ { width: `${ BarPercent }%` } }
							></div>
						</div>
						<span className="text-sm mt-1">{ children }</span>
					</div>
				</div>
			</Card>
		</>
	);

	return (
		<></>
	);
};
