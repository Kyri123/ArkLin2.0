import type {
	MultiValue,
	SingleValue
} from "react-select";


export interface InputSelectMask {
	Value: string,
	Text: string,
	PreAndSuffix: "'" | "\"" | "",
	HasValue?: boolean
}

export interface SelectOption<T = string> {
	value: T,
	label: string,
	disabled?: boolean,
	selected?: boolean
}

export type SingleOption<T = string> = SingleValue<SelectOption<T>>;
export type MultiOption<T = string> = MultiValue<SelectOption<T>>;
