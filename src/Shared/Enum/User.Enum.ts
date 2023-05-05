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

export function GetEnumValue<T>( Value : T | string ) : string {
	const Values : any = Object.entries( EPerm );
	const perms = [ EPerm_Server ];
	for ( const perm of perms ) {
		Values.push( Object.entries( perm ) );
	}

	// @ts-ignore
	return Values.find( ( [ , val ] ) => val === Value )?.[ 0 ]!;
}

export type TPermissions = EPerm | EPerm_Server;
