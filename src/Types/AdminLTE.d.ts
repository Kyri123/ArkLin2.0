import {
	IAdminLTEBaseT,
	IChildrenBaseProps
}                     from "./BaseTypes";
import { IconProp }   from "@fortawesome/fontawesome-svg-core";
import {
	HTMLAttributeAnchorTarget,
	HTMLInputTypeAttribute
}                     from "react";
import { TLTEColors } from "../Shared/Type/AdminLTE";
import { Variant }    from "react-bootstrap/types";

export type TFormOutline = "is-valid" | "is-warning" | "is-invalid" | "";

export interface IInputWithIcon extends IChildrenBaseProps {
	Icon : IconProp;
	InputType : HTMLInputTypeAttribute;
	Name : string;
	Placeholder? : string;
	Outline? : TFormOutline;
}

export interface IStateCardProps extends IChildrenBaseProps {
	BarPercent : number;
	Title : string;
	Color : TLTEColors;
	Icon : IconProp;
	BarColor : Variant;
}

export interface INavLinkProps extends IChildrenBaseProps {
	Disabled? : boolean;
	Icon : IconProp;
	To : string;
	Target? : HTMLAttributeAnchorTarget | undefined;
}

export interface ILTELoadingButton extends IAdminLTEButton {
	IsLoading? : boolean;
	LoadingIcon? : IconProp;
}


export interface IAdminLTEButton extends IAdminLTEBaseT<HTMLButtonElement> {
	Disabled? : boolean;
	Outline? : boolean;
	Flat? : boolean;
}