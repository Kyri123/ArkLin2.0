import { IServerCardProps }   from "../../../Types/Server";
import {
	useEffect,
	useRef
}                             from "react";
import { useArkServer }       from "../../../Hooks/useArkServer";
import { FontAwesomeIcon }    from "@fortawesome/react-fontawesome";
import { ServerStateToColor } from "../../../Lib/Conversion.Lib";
import { Dropdown }           from "react-bootstrap";
import { Link }               from "react-router-dom";

export default function CServerCard( Props : IServerCardProps ) {
	const CardRef = useRef<HTMLDivElement>( null );
	const { Data, IsValid, ServerMap, State } = useArkServer( Props.InstanceName );

	useEffect( () => {
		if ( CardRef.current ) {
			CardRef.current.style.setProperty( "border-width", "4px", "important" );
		}
	}, [ Data ] );

	if ( !IsValid() ) {
		return <></>;
	}

	return (
		<>
			<Dropdown.Divider className={ "m-0" } />
			<Dropdown.Item
				as={ Link }
				to={ `/server/${ Props.InstanceName }/logs` }
				className={ "p-2" }
			>
				<div className="d-flex">
					<div className="flex-shrink-0">
						<img src={ ServerMap.LOGO } alt={ Data.serverMap } width={ 65 } />
					</div>
					<div className="flex-grow-1 pe-1 ps-2">
						<h6 className="dropdown-item-title">{ Data.ark_SessionName }</h6>
						<p className="fs-7 text-muted mt-1">
							<FontAwesomeIcon icon={ "users" } className={ "me-1" } />{ " " }
							{ State.Player } / { Data.ark_MaxPlayers }
							<span
								className={ `float-end text-${ ServerStateToColor( State.State ) }` }
							>
                <FontAwesomeIcon icon={ "server" } />
              </span>
						</p>
					</div>
				</div>
			</Dropdown.Item>
		</>
	);
}
