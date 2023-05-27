import { serverStateToColor } from "@app/Lib/Conversion.Lib";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useArkServer } from "@hooks/useArkServer";
import type { ServerAdminCardProps } from "@page/app/pageComponents/adminServer/ServerAdminCard";
import {
	useEffect,
	useRef
} from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";


export default function CServerCard( Props: ServerAdminCardProps ) {
	const cardRef = useRef<HTMLDivElement>( null );
	const { data, isValid, serverMap, state } = useArkServer( Props.instanceName );

	useEffect( () => {
		if( cardRef.current ) {
			cardRef.current.style.setProperty( "border-width", "4px", "important" );
		}
	}, [ data ] );

	if( !isValid() ) {
		return <></>;
	}

	return (
		<>
			<Dropdown.Divider className="m-0" />
			<Dropdown.Item as={ Link } reloadDocument={ true }
				to={ `/app/server/${ Props.instanceName }/logs` }
				className="p-2">
				<div className="d-flex">
					<div className="flex-shrink-0">
						<img src={ serverMap.LOGO } alt={ data.serverMap } width={ 65 } />
					</div>
					<div className="flex-grow-1 pe-1 ps-2">
						<h6 className="dropdown-item-title">{ data.ark_SessionName }</h6>
						<p className="fs-7 text-muted mt-1">
							<FontAwesomeIcon icon="users" className="me-1" />{ " " }
							{ state.Player } / { data.ark_MaxPlayers }
							<span className={ `float-end text-${ serverStateToColor( state.State ) }` }>
								<FontAwesomeIcon icon="server" />
							</span>
						</p>
					</div>
				</div>
			</Dropdown.Item>
		</>
	);
}
