import { useId } from "react";
import type { Variant } from "react-bootstrap/types";


const lineColor = ( Line: string ): Variant => {
	let color: Variant = "light";
	if( Line.includes( "[DEBUG]" ) ) {
		color = "info";
	} else if( Line.includes( "[WARN]" ) ) {
		color = "warning";
	} else if( Line.includes( "[FATAL]" ) || Line.includes( "[ERROR]" ) ) {
		color = "danger";
	}

	return color;
};

export default function FormatLog( Props: { logContent: string } ) {
	const ID = useId();

	return (
		<>
			<table>
				<tbody>
					{ Props.logContent.split( "\n" )
						.reverse()
						.filter( e => e.replaceAll( " ", "" ).trim() !== "" )
						.map( ( Content, Idx ) => (
							<tr key={ ID + Idx }>
								<td align="center" valign="middle" style={ { width: 0 } } className="p-1 ps-2 pe-2 border-right border-info text-info">
									{ Idx }
								</td>
								<td valign="middle" className={ `p-1 ps-2 pe-2 text-${ lineColor( Content ) }` }>
									{ Content.replaceAll( "....", "" ) }
								</td>
							</tr>
						) ) }
				</tbody>
			</table>
		</>
	);
}
