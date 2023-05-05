/** @format */

import type { IconProp }                         from "@fortawesome/fontawesome-svg-core";
import type React, { HTMLAttributeAnchorTarget } from "react";
import type { Variant }                          from "react-bootstrap/types";
import type {
	IChildrenBaseProps,
	IPropsWithPermission
}                                                from "./BaseTypes";
import type { Button }                           from "react-bootstrap";
import type { CardProps }                        from "react-bootstrap/Card";

export type IStateCardProps = CardProps & IPropsWithPermission & {
	Color : Variant;
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

export type IconButtonProps = IPropsWithPermission &
	Button.ButtonProps & {
	IsLoading? : boolean;
	ForceDisable? : boolean;
	LoadingIcon? : IconProp;
};

export type ToggleButtonProps = IPropsWithPermission &
	Button.ButtonProps & {
	Value? : boolean;
	OnToggle? : ( Value : boolean ) => void;
	Ref? : React.Ref<boolean>;
}