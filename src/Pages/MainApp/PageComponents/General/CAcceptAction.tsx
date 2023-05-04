import type { IChildrenBaseProps } from "../../../../Types/BaseTypes";
import { Modal }                   from "react-bootstrap";
import { LTELoadingButton }        from "../../../../Components/Elements/AdminLTE/AdminLTE_Buttons";
import { FontAwesomeIcon }         from "@fortawesome/react-fontawesome";

export interface IAcceptActionFunction<
	F extends ( ...args : any[] ) => void = ( ...args : any[] ) => void
> {
	Payload : F | undefined;
	PayloadArgs : any[];
	ActionTitle : string;
}

export interface IAcceptAction<
	F extends ( ...args : any[] ) => void = ( ...args : any[] ) => void
> extends IChildrenBaseProps {
	Function : IAcceptActionFunction<F>;
	SetFunction : ( Value : IAcceptActionFunction<F> ) => void;
	OnCancel? : () => void;
	OnAccept? : () => void;
}

export default function CAcceptAction<F extends ( ...args : any[] ) => void>(
	Props : IAcceptAction<F>
) {
	const OnAccept = () => {
		if ( Props.Function && Props.Function.Payload ) {
			Props.Function.Payload( ...Props.Function.PayloadArgs );
			Props.SetFunction( {
				Payload: undefined,
				PayloadArgs: [],
				ActionTitle: ""
			} );
		}
		if ( Props.OnAccept ) {
			Props.OnAccept();
		}
	};

	const OnCancel = () => {
		if ( Props.OnCancel ) {
			Props.OnCancel();
		}
		Props.SetFunction( { Payload: undefined, PayloadArgs: [], ActionTitle: "" } );
	};

	return (
		<Modal
			centered
			show={ Props.Function.Payload !== undefined }
			onHide={ OnCancel }
		>
			<Modal.Body>
				{ Props.children ? (
					Props.children
				) : (
					<center className={ "pt-4 pb-4" }>
						<p>{ Props.Function.ActionTitle }</p>
						<LTELoadingButton
							onClick={ OnAccept }
							variant="success"
							IsLoading={ false }
						>
							<FontAwesomeIcon icon={ "check" }/> Action Ausführen
						</LTELoadingButton>
						<LTELoadingButton
							className={ "ml-4" }
							onClick={ OnCancel }
							variant="danger"
							IsLoading={ false }
						>
							<FontAwesomeIcon icon={ "cancel" }/> Action Abbrechen
						</LTELoadingButton>
					</center>
				) }
			</Modal.Body>
		</Modal>
	);
}
