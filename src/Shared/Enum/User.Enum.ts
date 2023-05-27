export enum EPerm {
	Super = "Alle Berechtigungen",
	ManagePanel = "ArkLin verwalten",
	PanelSettings = "ArkLin einstellen",
	PanelLog = "ArkLin Log ansehen",
	ManageServers = "Server Verwalten",
	ManageCluster = "Cluster Verwalten"
}

export enum EPermServer {
	ExecuteActions = "Befehle an Server senden."
}

export function GetEnumValue<T>( Value: T | string ): string {
	const values: any = Object.entries( EPerm );
	const perms = [ EPermServer ];
	for( const perm of perms ) {
		values.push( Object.entries( perm ) );
	}

	// @ts-ignore
	return values.find( ( [ , val ] ) => val === Value )?.[ 0 ]!;
}

export type TPermissions = EPerm | EPermServer;
