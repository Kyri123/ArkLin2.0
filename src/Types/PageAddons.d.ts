/** @format */

import { IChildrenBaseProps } from "./BaseTypes";

export interface IPageCounterProps<T> extends IChildrenBaseProps {
	PerPage? : number;
	OnSetPage : ( Value : T[] ) => void;
	Data : T[];
}
