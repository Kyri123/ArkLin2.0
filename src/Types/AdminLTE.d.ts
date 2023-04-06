/** @format */

import { IconProp }   from "@fortawesome/fontawesome-svg-core";
import React, {
	HTMLAttributeAnchorTarget,
	HTMLInputTypeAttribute
}                     from "react";
import { Variant }    from "react-bootstrap/types";
import { TLTEColors } from "../Shared/Type/AdminLTE";
import {
	IChildrenBaseProps,
	IPropsWithPermission
}                     from "./BaseTypes";
import { Button }     from "react-bootstrap";
import { CardProps }  from "react-bootstrap/Card";

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
	LoadingIcon? : IconProp;
};

export type ILTEToggleButton = IPropsWithPermission &
	Button.ButtonProps & {
	Value? : boolean;
	OnToggle? : ( Value : boolean ) => void;
	Ref? : React.Ref<boolean>;
}