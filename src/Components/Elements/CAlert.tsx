import { IChildrenBaseProps }    from "../../Types/BaseTypes";
import {
	useEffect,
	useState
}                                from "react";
import { IAPIResponseBase }      from "../../Types/API";
import { FontAwesomeIcon }       from "@fortawesome/react-fontawesome";
import { GenerateIconFromColor } from "../../Lib/Conversion.Lib";
import { Alert }                 from "react-bootstrap";

export interface IAlertProps extends IChildrenBaseProps {
	Data : IAPIResponseBase | undefined;
	OnClear : () => void;
	Disable? : boolean;
}

export function CAlert( Props : IAlertProps ) {
	const [ Dismiss, setDismiss ] = useState( false );

	useEffect( () => {
		setDismiss( false );

		const Timeout = setTimeout( () => setDismiss( true ), 10000 );
		return () => clearTimeout( Timeout );
	}, [ Props.Data ] )

	if ( Props.Disable || Dismiss || !Props.Data || !Props.Data.Message ) {
		return <></>;
	}

	return (
		<Alert variant={ Props.Data.Message.AlertType }>
			<h5><FontAwesomeIcon
				icon={ GenerateIconFromColor( Props.Data.Message.AlertType ) }/> { Props.Data.Message.Title }</h5>
			{ Props.Data.Message.Message }
		</Alert>
	);
}