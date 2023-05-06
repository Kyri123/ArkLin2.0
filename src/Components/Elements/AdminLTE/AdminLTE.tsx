import type { BootBase } from "../../../Types/BaseTypes";

export function LTERibbon( Props : BootBase ) {
	if ( Props.Hide ) {
		return <></>;
	}

	return (
		<div className="ribbon-wrapper" { ...Props }>
			<div className={ `ribbon bg-${ Props.Color || "danger" }` }>
				{ Props.children }
			</div>
		</div>
	);
}
