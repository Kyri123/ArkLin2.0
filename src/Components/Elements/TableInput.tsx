import type { ChildrenBaseProps } from "@app/Types/BaseTypes";
import type { InputSelectMask } from "@app/Types/Systeminformation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import type {
	ChangeEvent,
	HTMLInputTypeAttribute
} from "react";
import {
	useEffect,
	useId,
	useState
} from "react";
import { ButtonGroup } from "react-bootstrap";
import Select from "react-select";
import {
	IconButton,
	ToggleButton
} from "./Buttons";


export type TInputAlert = "" | "is-valid" | "is-invalid" | "is-warn";

export interface InputProps<
	T =
	| string
	| boolean
	| number
	| readonly string[]
	| number[]
	| string[]
	| undefined
	| Date
> extends ChildrenBaseProps {
	Type?: HTMLInputTypeAttribute,
	Value: T,
	onValueSet: ( Value: any ) => void,
	ValueKey?: string,
	InputSelectMask?: Record<string, InputSelectMask[]>,
	InputAlert?: TInputAlert,
	NumMin?: number,
	NumMax?: number
}

export interface SelectProps extends InputProps {
	ArraySupport?: boolean,
	ValueKey: string,
	InputSelectMask: Record<string, InputSelectMask[]>
}

export default function TableInput( Props: InputProps ) {
	const ID = useId();
	if( Props.Hide ) {
		return <></>;
	}

	if(
		!Array.isArray( Props.Value ) &&
		Props.ValueKey &&
		Props.InputSelectMask &&
		Props.InputSelectMask[ Props.ValueKey ]
	) {
		// @ts-ignore
		return <TableInputSelectWithMask { ...Props } />;
	}

	if(
		Array.isArray( Props.Value ) ||
		typeof Props.Value === "object" ||
		typeof Props.Value === "boolean"
	) {
		// @ts-ignore
		return <TableInputToggleButton { ...Props } />;
	}

	return (
		<tr>
			<td className="w-1/3">{ Props.children }</td>
			<td className="w-2/3">
				<input min={ Props.NumMin || 0 }
					max={ Props.NumMax }
					id={ ID }
					type={ Props.Type }
					className={ `form-control ${ Props.InputAlert || "" }` }
					value={ Props.Value as string }
					onChange={ Event =>
						Props.onValueSet(
							typeof Props.Value === "number"
								? parseInt( Event.target.value )
								: Event.target.value
						) } />
			</td>
		</tr>
	);
}

export function TableInputSelectWithMask( Props: SelectProps ) {
	const getInputSelectMask = ( Value: string ): InputSelectMask => {
		let mask: InputSelectMask = {
			Value: "",
			Text: "",
			PreAndSuffix: ""
		};

		if( selectedValue ) {
			const fMask = Props.InputSelectMask[ Props.ValueKey ].find(
				E => E.Value === Value
			);
			if( fMask ) {
				mask = fMask;
			}
		}

		return mask;
	};

	const [ selectedValue, setSelectedValue ] = useState<{
		value: string,
		label: string
	} | null>( null );
	const [ parameterValue, setParameterValue ] = useState<string>(
		( Props.Value as string ).split( "=" )[ 1 ]
			? ( Props.Value as string )
				.split( "=" )[ 1 ]
				.replaceAll(
					getInputSelectMask( ( Props.Value as string ).split( "=" )[ 0 ] ).PreAndSuffix,
					""
				)
			: ""
	);
	const ID = useId();

	useEffect( () => {
		if( selectedValue ) {
			setRow( selectedValue.value );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ selectedValue ] );

	if( Array.isArray( Props.Value ) || typeof Props.Value === "object" ) {
		return <TableInputArrayField { ...Props } />;
	}

	const setRow = ( Value = "" ) => {
		if( selectedValue ) {
			const row: InputSelectMask = getInputSelectMask( selectedValue.value );
			if( row.HasValue ) {
				Props.onValueSet(
					`${ Value }=${ row.PreAndSuffix }${ parameterValue }${ row.PreAndSuffix }`
				);
			} else {
				Props.onValueSet( row.Value );
			}
		} else {
			Props.onValueSet( "" );
		}
	};

	const onParameterChanges = ( Event: ChangeEvent<HTMLInputElement> ) => {
		setParameterValue( Event.target.value );
	};

	const getOptions = (): { value: string, label: string }[] => {
		const options: { value: string, label: string }[] = [];

		for( let i = 0; i < Props.InputSelectMask[ Props.ValueKey ].length; ++i ) {
			options.push( {
				value: Props.InputSelectMask[ Props.ValueKey ][ i ].Value,
				label: Props.InputSelectMask[ Props.ValueKey ][ i ].Text
			} );
		}

		return options;
	};

	const getCurrentValue = (): { value: string, label: string } | null => {
		const found = getOptions().find(
			E => E.value === ( Props.Value as string ).split( "=" )[ 0 ]
		);
		if( found ) {
			return found;
		}
		return null;
	};

	if( Props.ArraySupport ) {
		return (
			<>
				<Select className="pe-3 flex-grow-1 bd-highlight"
					value={ getCurrentValue() }
					onChange={ setSelectedValue }
					options={ getOptions() }
					isClearable={ false } />
				{ selectedValue && getInputSelectMask( selectedValue.value ).HasValue && (
					<div className="flex-grow-1 bd-highlight ps-2 pe-2">
						<input type="text"
							className={ `form-control ${ Props.InputAlert || "" }` }
							value={ ( Props.Value as string )
								.split( "=" )[ 1 ]
								?.replaceAll(
									getInputSelectMask( selectedValue.value ).PreAndSuffix,
									""
								) }
							onChange={ onParameterChanges } />
					</div>
				) }
				{ Props.children }
			</>
		);
	}

	return (
		<tr>
			<td className="w-1/3">{ Props.children }</td>
			<td className="w-2/3">
				<div className="d-flex bd-highlight w-100">
					<Select className="flex-grow-1 bd-highlight"
						value={ getCurrentValue() }
						onChange={ setSelectedValue }
						options={ getOptions() }
						isClearable={ true } />
					{ selectedValue && getInputSelectMask( selectedValue.value ).HasValue && (
						<div className="flex-grow-1 bd-highlight ps-2 pe-2">
							<input type="text"
								className={ `form-control ${ Props.InputAlert || "" }` }
								value={ ( Props.Value as string )
									.split( "=" )[ 1 ]
									?.replaceAll(
										getInputSelectMask( selectedValue.value ).PreAndSuffix,
										""
									) }
								onChange={ onParameterChanges } />
						</div>
					) }
				</div>
			</td>
		</tr>
	);
}

export function TableInputToggleButton( Props: InputProps<boolean> ) {
	if( Array.isArray( Props.Value ) || typeof Props.Value === "object" ) {
		return <TableInputArrayField { ...Props } />;
	}

	return (
		<tr>
			<td className="w-1/3">{ Props.children }</td>
			<td className="w-2/3">
				<ToggleButton className="w-100"
					Value={ Props.Value as boolean }
					onToggle={ Props.onValueSet } />
			</td>
		</tr>
	);
}

export function TableInputArrayField( Props: InputProps ) {
	const ID = useId();

	if( !Array.isArray( Props.Value ) && typeof Props.Value === "object" ) {
		console.error(
			`found ${ typeof Props.Value } in SmartInputArray!`,
			Props.Value
		);
		return <></>;
	}

	const onValueChanged = ( Value: string | number, Index: number ) => {
		const copy = _.cloneDeep( Props.Value as string[] | number[] );

		if( copy && Array.isArray( copy ) ) {
			if( copy[ Index ] !== undefined ) {
				copy[ Index ] =
					Props.Type === "number" ? parseInt( Value.toString() ) : Value;
				Props.onValueSet( copy );
			} else if( Index === 0 && copy.length <= 0 ) {
				Props.onValueSet( [ Value ] );
			}
		}
	};

	const onRemoveIndex = ( Index: number ) => {
		const copy = _.cloneDeep( Props.Value as string[] | number[] );
		if( copy && Array.isArray( copy ) && copy[ Index ] !== undefined ) {
			copy.splice( Index, 1 );
			Props.onValueSet( copy );
		}
	};

	const onAddIndex = () => {
		const copy = structuredClone<string[] | number[]>(
			Props.Value as string[] | number[]
		);
		if( copy && Array.isArray( copy ) ) {
			if( copy.length <= 0 ) {
				// @ts-ignore
				copy.push( Props.Type === "number" ? 0 : "" );
			}
			// @ts-ignore
			copy.push( Props.Type === "number" ? 0 : "" );
			Props.onValueSet( copy );
		}
	};

	return (
		<tr>
			<td className="w-1/3">{ Props.children }</td>
			<td className="w-2/3">
				{ ( Props.Value as string[] | number[] ).map( ( Value, Idx ) => (
					<div className="input-group w-100 pb-2" key={ ID + Idx }>
						{ Props.ValueKey &&
						Props.InputSelectMask &&
						Props.InputSelectMask[ Props.ValueKey ] ? (
							// @ts-ignore
								<TableInputSelectWithMask { ...Props }
									Value={ Value }
									ArraySupport={ true }
									onValueSet={ V => onValueChanged( V, Idx ) }>
									<ButtonGroup>
										<IconButton onClick={ () => onRemoveIndex( Idx ) }
											variant="danger">
											<FontAwesomeIcon icon="trash-alt" />
										</IconButton>
										<IconButton onClick={ onAddIndex }>
											<FontAwesomeIcon icon="plus" />
										</IconButton>
									</ButtonGroup>
								</TableInputSelectWithMask>
							) : (
								<>
									<input type={ Props.Type }
										className={ `form-control ${ Props.InputAlert || "" }` }
										value={ Value }
										onChange={ Event => onValueChanged( Event.target.value, Idx ) } />
									<div className="input-group-append">
										<ButtonGroup>
											<IconButton onClick={ () => onRemoveIndex( Idx ) }
												variant="danger">
												<FontAwesomeIcon icon="trash-alt" />
											</IconButton>
											<IconButton onClick={ onAddIndex }>
												<FontAwesomeIcon icon="plus" />
											</IconButton>
										</ButtonGroup>
									</div>
								</>
							) }
					</div>
				) ) }
				{ ( Props.Value as string[] | number[] ).length <= 0 && (
					<div className="input-group w-100 pb-2" key={ ID + "0" }>
						{ Props.ValueKey &&
						Props.InputSelectMask &&
						Props.InputSelectMask[ Props.ValueKey ] ? (
							// @ts-ignore
								<TableInputSelectWithMask { ...Props }
									Value=""
									ArraySupport={ true }
									onValueSet={ V => onValueChanged( V, 0 ) }>
									<ButtonGroup>
										<IconButton onClick={ onAddIndex }>
											<FontAwesomeIcon icon="plus" />
										</IconButton>
									</ButtonGroup>
								</TableInputSelectWithMask>
							) : (
								<>
									<input type={ Props.Type }
										className={ `form-control ${ Props.InputAlert || "" }` }
										value=""
										onChange={ Event => onValueChanged( Event.target.value, 0 ) } />
									<div className="input-group-append">
										<ButtonGroup>
											<IconButton onClick={ onAddIndex }>
												<FontAwesomeIcon icon="plus" />
											</IconButton>
										</ButtonGroup>
									</div>
								</>
							) }
					</div>
				) }
			</td>
		</tr>
	);
}
