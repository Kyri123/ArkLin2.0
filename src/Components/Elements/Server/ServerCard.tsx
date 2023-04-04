import { IServerCardProps }   from "../../../Types/Server";
import { Link }               from "react-router-dom";
import {
	useEffect,
	useRef
}                             from "react";
import { useArkServer }       from "../../../Hooks/useArkServer";
import { FontAwesomeIcon }    from "@fortawesome/react-fontawesome";
import { ServerStateToColor } from "../../../Lib/Conversion.Lib";

export default function CServerCard( Props : IServerCardProps ) {
	const CardRef = useRef<HTMLDivElement>( null );
	const { Data, IsValid, ServerMap, State } = useArkServer( Props.InstanceName );

	useEffect( () => {
		if ( CardRef.current ) {
			CardRef.current.style.setProperty( 'border-width', '4px', 'important' );
		}
	}, [ Data ] );

	if ( !IsValid() ) {
		return <></>
	}

	return (
		<>
			<div className="dropdown-divider"></div>
			<Link to={ `/server/${ Props.InstanceName }/logs` } className={ "dropdown-item" }>
				<div className="d-flex">
					<div className="flex-shrink-0">
						<img src={ ServerMap.LOGO } alt={ Data.serverMap }
							 className="img-size-50 img-circle me-3"/>
					</div>
					<div className="flex-grow-1">
						<h3 className="dropdown-item-title">
							{ Data.ark_SessionName }
							<span className={ `float-end text-${ ServerStateToColor( State.State ) }` }>
							 	<FontAwesomeIcon icon={ "server" }/>
							</span>
						</h3>
						<p className="fs-7 text-muted mt-1">
							<FontAwesomeIcon icon={ "users" }
											 className={ "me-1" }/> { State.Player } / { Data.ark_MaxPlayers }
						</p>
					</div>
				</div>
			</Link>
		</>
	);
}