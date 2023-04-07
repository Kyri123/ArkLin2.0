import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button }          from "react-bootstrap";
import {
	ILTELoadingButton,
	ILTEToggleButton
}                          from "../../../../Types/AdminLTE";
import React               from "react";

export const LTELoadingButton : React.FunctionComponent<ILTELoadingButton> = ( {
	Permission,
	IsLoading,
	Hide,
	LoadingIcon,
	...Props
} ) => {
	if ( Hide || ( Permission !== undefined && !Permission ) ) {
		return <></>;
	}

	return (
		<Button { ...Props } disabled={ IsLoading }>
			{ Props.IsLoading ? (
				<FontAwesomeIcon icon={ LoadingIcon || "spinner" } spin={ true }/>
			) : (
				Props.children
			) }
		</Button>
	);
};

export const LTEToggleButton : React.FunctionComponent<ILTEToggleButton> = ( { OnToggle, Value, Ref, ...Props } ) => {
	if ( Props.Hide || ( Props.Permission !== undefined && !Props.Permission ) ) {
		return <></>;
	}

	const OnClick = () => {
		if ( OnToggle ) {
			OnToggle( !Value );
		}
		if ( Ref ) {
			Ref.current = !Props.Ref.current;
		}
	};

	const IsActive = () => {
		if ( Value === undefined ) {
			return Ref?.current;
		}
		return Value;
	};

	return (
		<Button
			{ ...Props }
			className={ Props.className || "btn-sm rounded-0" }
			variant={ IsActive() ? "success" : "danger" }
			onClick={ OnClick }
		>
			<FontAwesomeIcon icon={ IsActive() ? "check" : "times" }/>{ " " }
			{ Props.children }
		</Button>
	);
};
