/** @format */

import type {
	HTMLAttributes,
	PropsWithChildren
}                            from "react";
import type { TPermissions } from "@shared/Enum/User.Enum";
import type { Variant }      from "@shared/Type/AdminLTE";

export interface BootBase extends ChildrenBaseProps {
	Color? : Variant;
}

export interface BootBaseT<T> extends ChildrenBasePropsT<T> {
	BtnColor? : Variant;
}

export interface ChildrenBasePropsT<T> extends HTMLAttributes<T> {
	ref? : any;
	Permission? : boolean;
	Hide? : boolean;
}

export interface ChildrenBaseProps extends HTMLAttributes<HTMLDivElement> {
	ref? : any;
	Permission? : TPermissions;
	Hide? : boolean;
}

export interface PropsWithPermission extends PropsWithChildren {
	Permission? : boolean;
	Hide? : boolean;
}
