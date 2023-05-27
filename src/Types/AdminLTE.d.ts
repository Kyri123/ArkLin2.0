/** @format */

import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import type React from "react";
import type { CardProps } from "react-bootstrap/Card";
import type { Variant } from "react-bootstrap/types";
import type { PropsWithPermission } from "./BaseTypes";


export type IStateCardProps = CardProps & PropsWithPermission & {
	Color: Variant,
	BarPercent: number,
	Title: string,
	Icon: IconProp,
	BarColor: Variant
};

export type IconButtonProps = PropsWithPermission &
Button.ButtonProps & {
	IsLoading?: boolean,
	ForceDisable?: boolean,
	LoadingIcon?: IconProp
};

export type ToggleButtonProps = PropsWithPermission &
Button.ButtonProps & {
	Value?: boolean,
	onToggle?: ( Value: boolean ) => void,
	Ref?: React.Ref<boolean>
};
