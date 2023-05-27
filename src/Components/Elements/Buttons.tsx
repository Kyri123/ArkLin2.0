import type {
	IconButtonProps,
	ToggleButtonProps
} from "@app/Types/AdminLTE";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type React from "react";
import { Button } from "react-bootstrap";


export const IconButton: React.FunctionComponent<IconButtonProps> = ( {
	Permission,
	IsLoading,
	Hide,
	LoadingIcon,
	ForceDisable,
	...Props
} ) => {
	if( Hide || ( Permission !== undefined && !Permission ) ) {
		return <></>;
	}

	return (
		<Button { ...Props } disabled={ IsLoading || ForceDisable }>
			{ Props.IsLoading ? (
				<FontAwesomeIcon icon={ LoadingIcon || "spinner" } spin={ true } />
			) : (
				Props.children
			) }
		</Button>
	);
};

export const ToggleButton: React.FunctionComponent<ToggleButtonProps> = ( { onToggle, Value, Ref, ...Props } ) => {
	if( Props.Hide || ( Props.Permission !== undefined && !Props.Permission ) ) {
		return <></>;
	}

	const onClick = () => {
		if( onToggle ) {
			onToggle( !Value );
		}
		if( Ref ) {
			Ref.current = !Props.Ref.current;
		}
	};

	const isActive = () => {
		if( Value === undefined ) {
			return Ref?.current;
		}
		return Value;
	};

	return (
		<Button { ...Props }
			className={ `${ isActive() ? "" : "px-3" } ${ Props.className || "btn-sm rounded-0" }` }
			variant={ isActive() ? "success" : "danger" }
			onClick={ onClick }>
			<FontAwesomeIcon icon={ isActive() ? "check" : "times" } />{ " " }
			{ Props.children }
		</Button>
	);
};
