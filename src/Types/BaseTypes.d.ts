/** @format */

import type {
	HTMLAttributes,
	PropsWithChildren
}                            from "react";
import type { TPermissions } from "@shared/Enum/User.Enum";
import type { TLTEColors }   from "@shared/Type/AdminLTE";

export interface IAdminLTEBase extends IChildrenBaseProps {
	Color? : TLTEColors;
}

export interface IAdminLTEBaseT<T> extends IChildrenBasePropsT<T> {
	BtnColor? : TLTEColors;
}

export interface IChildrenBasePropsT<T> extends HTMLAttributes<T> {
	ref? : any;
	Permission? : boolean;
	Hide? : boolean;
}

export interface IChildrenBaseProps extends HTMLAttributes<HTMLDivElement> {
	ref? : any;
	Permission? : TPermissions;
	Hide? : boolean;
}

export interface IPropsWithPermission extends PropsWithChildren {
	Permission? : boolean;
	Hide? : boolean;
}
