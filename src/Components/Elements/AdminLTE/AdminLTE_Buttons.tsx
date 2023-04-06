import { FontAwesomeIcon }   from "@fortawesome/react-fontawesome";
import { Button }            from "react-bootstrap";
import { ILTELoadingButton } from "../../../Types/AdminLTE";
import React                 from "react";

export function LTELoadingButton( Props : ILTELoadingButton ) {
	if ( Props.Hide || ( Props.Permission !== undefined && !Props.Permission ) ) {
		return <></>;
	}

	return (
		<Button { ...Props } disabled={ Props.IsLoading }>
			{ Props.IsLoading ? (
				<FontAwesomeIcon icon={ Props.LoadingIcon || "spinner" } spin={ true } />
			) : (
				Props.children
			) }
		</Button>
	);
}

export function LTEToggleButton(
	Props : ILTELoadingButton & {
		Value? : boolean;
		OnChange? : ( Value : boolean ) => void;
		Ref? : React.Ref<boolean>;
	}
) {
	if ( Props.Hide || ( Props.Permission !== undefined && !Props.Permission ) ) {
		return <></>;
	}

	const OnClick = () => {
		if ( Props.OnChange ) {
			Props.OnChange( !Props.Value );
		}
		if ( Props.Ref ) {
			Props.Ref.current = !Props.Ref.current;
		}
	}

	const IsActive = () => {
		if ( Props.Value === undefined ) {
			return Props.Ref?.current;
		}
		return Props.Value;
	}

	return (
		<LTELoadingButton
			{ ...Props }
			className={ Props.className || "btn-sm rounded-0" }
			BtnColor={ IsActive() ? "success" : "danger" }
			onClick={ OnClick }
		>
			<FontAwesomeIcon icon={ IsActive() ? "check" : "times" } />{ " " }
			{ Props.children }
		</LTELoadingButton>
	);
}
