import type { TLTEColors } from "@app/Types/AdminLTE";
import { EServerState }    from "@shared/Enum/EServerState";

export function GenerateIconFromColor( Type : TLTEColors ) : any {
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

export function ServerStateToColor( State : EServerState ) : string {
	switch ( State ) {
		case EServerState.online:
			return "success";
		case EServerState.offline:
			return "danger";
		case EServerState.actionInProgress:
			return "info";
		case EServerState.running:
			return "primary";
		default:
			return "warning";
	}
}

export function ServerStateToReadableString( State : EServerState ) : string {
	switch ( State ) {
		case EServerState.notInstalled:
			return "Nicht Installiert";
		case EServerState.actionInProgress:
			return "Aktion in Arbeit...";
		case EServerState.running:
			return "Server Startet";
		default:
			return State;
	}
}
