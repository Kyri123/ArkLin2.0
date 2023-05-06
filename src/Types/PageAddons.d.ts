/** @format */

import type { ChildrenBaseProps } from "./BaseTypes";

export interface IPageCounterProps<T> extends ChildrenBaseProps {
	PerPage? : number;
	OnSetPage : ( Value : T[] ) => void;
	Data : T[];
}
