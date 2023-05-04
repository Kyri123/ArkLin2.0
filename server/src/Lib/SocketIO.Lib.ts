import type { Cluster } from "@server/MongoDB/DB_Cluster";

export async function EmitClusters( Element : Cluster ) : Promise<void> {
	SocketIO.emit( "OnClusterUpdated", { [ Element._id! ]: Element } );
}