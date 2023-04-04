import { TLTEColors }   from "../Shared/Type/AdminLTE";
import { IconProp }     from "@fortawesome/fontawesome-svg-core";
import { TServerState } from "../Shared/Type/ArkSE";

export function GenerateIconFromColor( Type : TLTEColors ) : IconProp {
	switch ( Type ) {
		case "danger":
			break;
		case "success":
			return [ "fas", "check" ];
		case "info":
			break;
		case "primary":
			break;
		case "secondary":
			break;
		case "black":
			break;
		case "gray-dark":
			break;
		case "light":
			break;
		case "indigo":
			break;
		case "warning":
			break;
		case "light-blue":
			break;
		case "navy":
			break;
		case "purple":
			break;
		case "fuchsia":
			break;
		case "pink":
			break;
		case "maroon":
			break;
		case "orange":
			break;
		case "lime":
			break;
		case "teal":
			break;
		case "olive":
			break;
	}
	return [ "fas", "warning" ];
}

export function ServerStateToColor( State : TServerState ) : string {
	switch ( State ) {
		case "Online":
			return "success";
		case "Offline":
			return "danger";
		case "ActionInProgress":
			return "info";
		case "Running":
			return "primary";
		default:
			return "warning";
	}
}

export function ServerStateToReadableString( State : TServerState ) : string {
	switch ( State ) {
		case "NotInstalled":
			return "Nicht Installiert";
		case "ActionInProgress":
			return "Aktion in Arbeit...";
		case "Running":
			return "Server Startet";
		default:
			return State;
	}
}