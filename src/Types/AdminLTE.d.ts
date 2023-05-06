/** @format */

import type { IconProp }            from "@fortawesome/fontawesome-svg-core";
import type React                   from "react";
import type { Variant }             from "react-bootstrap/types";
import type { PropsWithPermission } from "./BaseTypes";
import type { Button }              from "react-bootstrap";
import type { CardProps }           from "react-bootstrap/Card";

export type IStateCardProps = CardProps & PropsWithPermission & {
	Color : Variant;
	BarPercent : number;
	Title : string;
	Icon : IconProp;
	BarColor : Variant;
}

export type IconButtonProps = PropsWithPermission &
	Button.ButtonProps & {
	IsLoading? : boolean;
	ForceDisable? : boolean;
	LoadingIcon? : IconProp;
};

export type ToggleButtonProps = PropsWithPermission &
	Button.ButtonProps & {
	Value? : boolean;
	OnToggle? : ( Value : boolean ) => void;
	Ref? : React.Ref<boolean>;
}