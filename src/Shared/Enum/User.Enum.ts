export enum EPerm {
	Super = "Alle Berechtigungen",
	ManagePanel = "ArkLin verwalten",
	PanelSettings = "ArkLin einstellen",
	PanelLog = "ArkLin Log ansehen",
	ManageServers = "Server Verwalten",
	ManageCluster = "Cluster Verwalten",
}

export enum EPerm_Server {
	ExecuteActions = "Befehle an Server senden.",
}

export function GetEnumValue<T>( Enum : T, Value : T | string ) : string {
	return Object.entries( Enum as any ).find( ( [ , val ] ) => val === Value )?.[ 0 ]!;
}

export type TPermissions = EPerm | EPerm_Server;
