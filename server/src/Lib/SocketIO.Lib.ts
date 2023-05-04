import type { IMO_Cluster } from "../../../src/Types/MongoDB";

export async function EmitClusters( Element : IMO_Cluster ) : Promise<void> {
	SocketIO.emit( "OnClusterUpdated", { [ Element._id! ]: Element } );
}