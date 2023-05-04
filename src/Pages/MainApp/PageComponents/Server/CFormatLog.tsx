import { useId }           from "react";
import type { TLTEColors } from "@shared/Type/AdminLTE";

export default function CFormatLog( Props : { LogContent : string } ) {
	const ID = useId();
	const LineColor = ( Line : string ) : TLTEColors => {
		let Color : TLTEColors = "light";
		if ( Line.includes( "[DEBUG]" ) ) {
			Color = "purple";
		}
		else if ( Line.includes( "[WARN]" ) ) {
			Color = "warning";
		}
		else if ( Line.includes( "[FATAL]" ) || Line.includes( "[ERROR]" ) ) {
			Color = "danger";
		}

		return Color;
	};

	return (
		<>
			<table>
				<tbody>
				{ Props.LogContent.split( "\n" )
					.reverse()
					.filter( ( e ) => e.replaceAll( " ", "" ).trim() !== "" )
					.map( ( Content, Idx ) => (
						<tr key={ ID + Idx }>
							<td
								align="center"
								valign="middle"
								style={ { width: 0 } }
								className={ "p-1 ps-2 pe-2 border-right border-info text-info" }
							>
								{ Idx }
							</td>
							<td
								valign="middle"
								className={ `p-1 ps-2 pe-2 text-${ LineColor( Content ) }` }
							>
								{ Content.replaceAll( "....", "" ) }
							</td>
						</tr>
					) ) }
				</tbody>
			</table>
		</>
	);
}
