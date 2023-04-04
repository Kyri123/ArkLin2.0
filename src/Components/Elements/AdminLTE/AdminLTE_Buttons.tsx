import { ILTELoadingButton } from "../../../Types/AdminLTE";
import { FontAwesomeIcon }   from "@fortawesome/react-fontawesome";


export function LTELoadingButton( Props : ILTELoadingButton ) {
	if ( Props.Hide || ( Props.Permission !== undefined && !Props.Permission ) ) {
		return <></>;
	}

	return (
		<button onClick={ Props.onClick } ref={ Props.ref }
				className={ `btn ${ Props.Flat ? "btn-flat" : "" } btn${ Props.Outline ? "-outline" : "" }-${ Props.BtnColor || "primary" } ${ Props.className || "" }` }
				disabled={ Props.IsLoading || Props.Disabled }>
			{ Props.IsLoading ?
				<FontAwesomeIcon icon={ Props.LoadingIcon || "spinner" } spin={ true }/> : Props.children }
		</button>
	);
}


export function LTEToggleButton( Props : ILTELoadingButton & {
	Value : boolean;
	OnToggle : ( NewValue : boolean ) => void;
} ) {
	if ( Props.Hide || ( Props.Permission !== undefined && !Props.Permission ) ) {
		return <></>;
	}

	return (
		<LTELoadingButton { ...Props } className={ Props.className || "btn-sm rounded-0" }
						  BtnColor={ Props.Value ? "success" : "danger" }
						  onClick={ () => Props.OnToggle( !Props.Value ) }>
			<FontAwesomeIcon icon={ Props.Value ? "check" : "times" }/> { Props.children }
		</LTELoadingButton>
	);
}