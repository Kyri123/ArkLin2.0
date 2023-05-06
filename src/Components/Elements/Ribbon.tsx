import type { BootBase } from "@app/Types/BaseTypes";

export function Ribbon( Props : BootBase ) {
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
