import type { INavLinkProps }     from "../../../Types/AdminLTE";
import { useContext }             from "react";
import { FontAwesomeIcon }        from "@fortawesome/react-fontawesome";
import type { ChildrenBaseProps } from "../../../Types/BaseTypes";
import { Link }                   from "react-router-dom";
import AccountContext             from "@context/AccountContext";

export function LTENavLink( Props : INavLinkProps ) {
	const { Account } = useContext( AccountContext );

	if (
		Props.Hide ||
		( Props.Permission && !Account.HasPermission( Props.Permission ) )
	) {
		return <></>;
	}

	return (
		<li
			className={ `nav-item ${ Props.Disabled ? "disabled" : "" } ${
				Props.className || ""
			}` }
		>
			<Link
				to={ !Props.Disabled ? Props.To : "#" }
				className={ `nav-link ${
					window.location.href.includes( Props.To ) ? "active" : ""
				} ` }
				target={ Props.Target }
			>
				<FontAwesomeIcon icon={ Props.Icon } className="nav-icon"/>
				<p>{ Props.children }</p>
			</Link>
		</li>
	);
}

export function LTENavDiv( Props : ChildrenBaseProps ) {
	if ( Props.Hide ) {
		return <></>;
	}

	return <div className="mt-2 mb-2 user-panel"></div>;
}
