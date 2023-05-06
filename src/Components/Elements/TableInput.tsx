import type { ChildrenBaseProps } from "@app/Types/BaseTypes";
import type {
	ChangeEvent,
	HTMLInputTypeAttribute
}                                 from "react";
import {
	useEffect,
	useId,
	useState
}                                 from "react";
import { ButtonGroup }            from "react-bootstrap";
import {
	IconButton,
	ToggleButton
}                                 from "./Buttons";
import { FontAwesomeIcon }        from "@fortawesome/react-fontawesome";
import Select                     from "react-select";
import type { InputSelectMask }   from "@app/Types/Systeminformation";
import ReactMarkdown              from "react-markdown";

export type TInputAlert = "" | "is-valid" | "is-invalid" | "is-warn";

export interface InputProps<
	T =
			| string
		| boolean
		| number
		| ReadonlyArray<string>
		| number[]
		| string[]
		| undefined
		| Date
> extends ChildrenBaseProps {
	Type? : HTMLInputTypeAttribute;
	Value : T;
	OnValueSet : ( Value : any ) => void;
	ValueKey? : string;
	InputSelectMask? : Record<string, InputSelectMask[]>;
	InputAlert? : TInputAlert;
	NumMin? : number;
	NumMax? : number;
}

export interface SelectProps extends InputProps {
	ArraySupport? : boolean;
	ValueKey : string;
	InputSelectMask : Record<string, InputSelectMask[]>;
}

export default function TableInput( Props : InputProps ) {
	const ID = useId();
	if ( Props.Hide ) {
		return <></>;
	}

	if (
		!Array.isArray( Props.Value ) &&
		Props.ValueKey &&
		Props.InputSelectMask &&
		Props.InputSelectMask[ Props.ValueKey ]
	) {
		// @ts-ignore
		return <TableInputSelectWithMask { ...Props } />;
	}

	if (
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
				<input
					min={ Props.NumMin || 0 }
					max={ Props.NumMax }
					id={ ID }
					type={ Props.Type }
					className={ `form-control ${ Props.InputAlert || "" }` }
					value={ Props.Value as string }
					onChange={ ( Event ) =>
						Props.OnValueSet(
							typeof Props.Value === "number"
								? parseInt( Event.target.value )
								: Event.target.value
						)
					}
				/>
			</td>
		</tr>
	);
}

export function TableInputSelectWithMask( Props : SelectProps ) {
	const GetInputSelectMask = ( Value : string ) : InputSelectMask => {
		let Mask : InputSelectMask = {
			Value: "",
			Text: "",
			PreAndSuffix: ""
		};

		if ( SelectedValue ) {
			const fMask = Props.InputSelectMask[ Props.ValueKey ].find(
				( E ) => E.Value === Value
			);
			if ( fMask ) {
				Mask = fMask;
			}
		}

		return Mask;
	};

	const [ SelectedValue, setSelectedValue ] = useState<{
		value : string;
		label : string;
	} | null>( null );
	const [ ParameterValue, setParameterValue ] = useState<string>(
		( Props.Value as string ).split( "=" )[ 1 ]
			? ( Props.Value as string )
				.split( "=" )[ 1 ]
				.replaceAll(
					GetInputSelectMask( ( Props.Value as string ).split( "=" )[ 0 ] ).PreAndSuffix,
					""
				)
			: ""
	);
	const ID = useId();

	useEffect( () => {
		if ( SelectedValue ) {
			SetRow( SelectedValue.value );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ SelectedValue ] );

	if ( Array.isArray( Props.Value ) || typeof Props.Value === "object" ) {
		return <TableInputArrayField { ...Props } />;
	}

	const SetRow = ( Value = "" ) => {
		if ( SelectedValue ) {
			const Row : InputSelectMask = GetInputSelectMask( SelectedValue.value );
			if ( Row.HasValue ) {
				Props.OnValueSet(
					`${ Value }=${ Row.PreAndSuffix }${ ParameterValue }${ Row.PreAndSuffix }`
				);
			}
			else {
				Props.OnValueSet( Row.Value );
			}
		}
		else {
			Props.OnValueSet( "" );
		}
	};

	const OnParameterChanges = ( Event : ChangeEvent<HTMLInputElement> ) => {
		setParameterValue( Event.target.value );
	};

	const GetOptions = () : { value : string; label : string }[] => {
		const Options : { value : string; label : string }[] = [];

		for ( let Idx = 0; Idx < Props.InputSelectMask[ Props.ValueKey ].length; ++Idx ) {
			Options.push( {
				value: Props.InputSelectMask[ Props.ValueKey ][ Idx ].Value,
				label: Props.InputSelectMask[ Props.ValueKey ][ Idx ].Text
			} );
		}

		return Options;
	};

	const GetCurrentValue = () : { value : string; label : string } | null => {
		const Found = GetOptions().find(
			( E ) => E.value === ( Props.Value as string ).split( "=" )[ 0 ]
		);
		if ( Found ) {
			return Found;
		}
		return null;
	};

	if ( Props.ArraySupport ) {
		return (
			<>
				<Select
					className={ `pe-3 flex-grow-1 bd-highlight` }
					value={ GetCurrentValue() }
					onChange={ setSelectedValue }
					options={ GetOptions() }
					isClearable={ false }
				/>
				{ SelectedValue && GetInputSelectMask( SelectedValue.value ).HasValue && (
					<div className="flex-grow-1 bd-highlight ps-2 pe-2">
						<input
							type="text"
							className={ `form-control ${ Props.InputAlert || "" }` }
							value={ ( Props.Value as string )
								.split( "=" )[ 1 ]
								?.replaceAll(
									GetInputSelectMask( SelectedValue.value ).PreAndSuffix,
									""
								) }
							onChange={ OnParameterChanges }
						/>
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
					<Select
						className={ `flex-grow-1 bd-highlight` }
						value={ GetCurrentValue() }
						onChange={ setSelectedValue }
						options={ GetOptions() }
						isClearable={ true }
					/>
					{ SelectedValue && GetInputSelectMask( SelectedValue.value ).HasValue && (
						<div className="flex-grow-1 bd-highlight ps-2 pe-2">
							<input
								type="text"
								className={ `form-control ${ Props.InputAlert || "" }` }
								value={ ( Props.Value as string )
									.split( "=" )[ 1 ]
									?.replaceAll(
										GetInputSelectMask( SelectedValue.value ).PreAndSuffix,
										""
									) }
								onChange={ OnParameterChanges }
							/>
						</div>
					) }
				</div>
			</td>
		</tr>
	);
}

export function TableInputToggleButton( Props : InputProps<boolean> ) {
	const ID = useId();

	if ( Array.isArray( Props.Value ) || typeof Props.Value === "object" ) {
		return <TableInputArrayField { ...Props } />;
	}

	return (
		<tr>
			<td className="w-1/3">{ Props.children }</td>
			<td className="w-2/3">
				<ToggleButton
					className={ "w-100" }
					Value={ Props.Value as boolean }
					OnToggle={ Props.OnValueSet }
				/>
			</td>
		</tr>
	);
}

export function TableInputArrayField( Props : InputProps ) {
	const ID = useId();

	if ( !Array.isArray( Props.Value ) && typeof Props.Value === "object" ) {
		console.error(
			`Found ${ typeof Props.Value } in TableInputArrayField!`,
			Props.Value
		);
		return <></>;
	}

	const OnValueChanged = ( Value : string | number, Index : number ) => {
		const Copy = structuredClone<string[] | number[]>(
			Props.Value as string[] | number[]
		);

		if ( Copy && Array.isArray( Copy ) ) {
			if ( Copy[ Index ] !== undefined ) {
				Copy[ Index ] =
					Props.Type === "number" ? parseInt( Value.toString() ) : Value;
				Props.OnValueSet( Copy );
			}
			else if ( Index === 0 && Copy.length <= 0 ) {
				Props.OnValueSet( [ Value ] );
			}
		}
	};

	const OnRemoveIndex = ( Index : number ) => {
		const Copy = structuredClone<string[] | number[]>(
			Props.Value as string[] | number[]
		);
		if ( Copy && Array.isArray( Copy ) && Copy[ Index ] !== undefined ) {
			Copy.splice( Index, 1 );
			Props.OnValueSet( Copy );
		}
	};

	const OnAddIndex = () => {
		const Copy = structuredClone<string[] | number[]>(
			Props.Value as string[] | number[]
		);
		if ( Copy && Array.isArray( Copy ) ) {
			if ( Copy.length <= 0 ) {
				// @ts-ignore
				Copy.push( Props.Type === "number" ? 0 : "" );
			}
			// @ts-ignore
			Copy.push( Props.Type === "number" ? 0 : "" );
			Props.OnValueSet( Copy );
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
							<TableInputSelectWithMask
								{ ...Props }
								Value={ Value }
								ArraySupport={ true }
								OnValueSet={ ( V ) => OnValueChanged( V, Idx ) }
							>
								<ButtonGroup>
									<IconButton
										onClick={ () => OnRemoveIndex( Idx ) }
										variant={ "danger" }
									>
										<FontAwesomeIcon icon={ "trash-alt" }/>
									</IconButton>
									<IconButton onClick={ OnAddIndex }>
										<FontAwesomeIcon icon={ "plus" }/>
									</IconButton>
								</ButtonGroup>
							</TableInputSelectWithMask>
						) : (
							<>
								<input
									type={ Props.Type }
									className={ `form-control ${ Props.InputAlert || "" }` }
									value={ Value }
									onChange={ ( Event ) => OnValueChanged( Event.target.value, Idx ) }
								/>
								<div className="input-group-append">
									<ButtonGroup>
										<IconButton
											onClick={ () => OnRemoveIndex( Idx ) }
											variant={ "danger" }
										>
											<FontAwesomeIcon icon={ "trash-alt" }/>
										</IconButton>
										<IconButton onClick={ OnAddIndex }>
											<FontAwesomeIcon icon={ "plus" }/>
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
							<TableInputSelectWithMask
								{ ...Props }
								Value={ "" }
								ArraySupport={ true }
								OnValueSet={ ( V ) => OnValueChanged( V, 0 ) }
							>
								<ButtonGroup>
									<IconButton onClick={ OnAddIndex }>
										<FontAwesomeIcon icon={ "plus" }/>
									</IconButton>
								</ButtonGroup>
							</TableInputSelectWithMask>
						) : (
							<>
								<input
									type={ Props.Type }
									className={ `form-control ${ Props.InputAlert || "" }` }
									value={ "" }
									onChange={ ( Event ) => OnValueChanged( Event.target.value, 0 ) }
								/>
								<div className="input-group-append">
									<ButtonGroup>
										<IconButton onClick={ OnAddIndex }>
											<FontAwesomeIcon icon={ "plus" }/>
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
