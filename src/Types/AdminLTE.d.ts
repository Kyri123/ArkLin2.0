/** @format */

import type { IconProp }   from "@fortawesome/fontawesome-svg-core";
import type React, {
	HTMLAttributeAnchorTarget,
	HTMLInputTypeAttribute
}                          from "react";
import type { Variant }    from "react-bootstrap/types";
import type { TLTEColors } from "@shared/Type/AdminLTE";
import type {
	IChildrenBaseProps,
	IPropsWithPermission
}                          from "./BaseTypes";
import type { Button }     from "react-bootstrap";
import type { CardProps }  from "react-bootstrap/Card";

export type TLTEColors =
	| "danger"
	| "success"
	| "info"
	| "primary"
	| "secondary"
	| "black"
	| "gray-dark"
	| "light"
	| "indigo"
	| "warning"
	| "light-blue"
	| "navy"
	| "purple"
	| "fuchsia"
	| "pink"
	| "maroon"
	| "orange"
	| "lime"
	| "teal"
	| "olive";


export type TFormOutline = "is-valid" | "is-warning" | "is-invalid" | "";

export interface IInputWithIcon extends IChildrenBaseProps {
	Icon : IconProp;
	InputType : HTMLInputTypeAttribute;
	Name : string;
	Placeholder? : string;
	Outline? : TFormOutline;
}

export type IStateCardProps = CardProps & IPropsWithPermission & {
	Color : TLTEColors;
	BarPercent : number;
	Title : string;
	Icon : IconProp;
	BarColor : Variant;
}

export interface INavLinkProps extends IChildrenBaseProps {
	Disabled? : boolean;
	Icon : IconProp;
	To : string;
	Target? : HTMLAttributeAnchorTarget | undefined;
}

export type ILTELoadingButton = IPropsWithPermission &
	Button.ButtonProps & {
	IsLoading? : boolean;
	ForceDisable? : boolean;
	LoadingIcon? : IconProp;
};

export type ILTEToggleButton = IPropsWithPermission &
	Button.ButtonProps & {
	Value? : boolean;
	OnToggle? : ( Value : boolean ) => void;
	Ref? : React.Ref<boolean>;
}