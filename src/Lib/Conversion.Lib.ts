import { EServerState } from "@shared/Enum/EServerState";


export function serverStateToColor( State: EServerState ): string {
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

export function serverStateToReadableString( State: EServerState ): string {
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
