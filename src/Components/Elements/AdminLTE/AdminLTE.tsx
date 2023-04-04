import { IInputWithIcon }  from "../../../Types/AdminLTE";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IAdminLTEBase }   from "../../../Types/BaseTypes";

export function LTEInputWithIcon( Props : IInputWithIcon ) {
	if ( Props.Hide ) {
		return <></>;
	}

	return (
		<div className={ `input-group ${ Props.className || "" }` }>
			<input name={ Props.Name } type={ Props.InputType } className={ `form-control ${ Props.Outline || "" }` }
				   placeholder={ Props.Placeholder }/>
			<div className="input-group-text">
				<FontAwesomeIcon icon={ Props.Icon }/>
			</div>
		</div>
	);
}

export function LTERibbon( Props : IAdminLTEBase ) {
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