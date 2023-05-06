import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button }          from "react-bootstrap";
import type {
	IconButtonProps,
	ToggleButtonProps
}                          from "@app/Types/AdminLTE";
import type React          from "react";


export const IconButton : React.FunctionComponent<IconButtonProps> = ( {
	Permission,
	IsLoading,
	Hide,
	LoadingIcon,
	ForceDisable,
	...Props
} ) => {
	if ( Hide || ( Permission !== undefined && !Permission ) ) {
		return <></>;
	}

	return (
		<Button { ...Props } disabled={ IsLoading || ForceDisable }>
			{ Props.IsLoading ? (
				<FontAwesomeIcon icon={ LoadingIcon || "spinner" } spin={ true }/>
			) : (
				Props.children
			) }
		</Button>
	);
};

export const ToggleButton : React.FunctionComponent<ToggleButtonProps> = ( { OnToggle, Value, Ref, ...Props } ) => {
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
			className={ `${ IsActive() ? "" : "px-3" } ${ Props.className || "btn-sm rounded-0" }` }
			variant={ IsActive() ? "success" : "danger" }
			onClick={ OnClick }
		>
			<FontAwesomeIcon icon={ IsActive() ? "check" : "times" }/>{ " " }
			{ Props.children }
		</Button>
	);
};
