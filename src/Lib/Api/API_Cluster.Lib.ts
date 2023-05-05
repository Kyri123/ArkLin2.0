import { API_QueryLib }             from "./API_Query.Lib";
import type {
	TResponse_Cluster_CreateCluster,
	TResponse_Cluster_GetClusters,
	TResponse_Cluster_RemoveCluster,
	TResponse_Cluster_SendCommandToCluster,
	TResponse_Cluster_SetCluster
}                                   from "@app/Types/API_Response";
import { EClusterApiUrl }           from "@shared/Enum/Routing";
import type {
	TRequest_Cluster_CreateCluster,
	TRequest_Cluster_GetClusters,
	TRequest_Cluster_RemoveCluster,
	TRequest_Cluster_SendCommandToCluster,
	TRequest_Cluster_SetCluster
}                                   from "@app/Types/API_Request";
import type { EArkmanagerCommands } from "../serverUtils";
import type { Cluster }             from "@server/MongoDB/DB_Cluster";

export class API_ClusterLib {
	static async SetCluster(
		Id : string,
		Config : Cluster
	) : Promise<TResponse_Cluster_SetCluster> {
		return await API_QueryLib.PostToAPI<TResponse_Cluster_SetCluster, TRequest_Cluster_SetCluster<false>>(
			EClusterApiUrl.setcluster, { Id, Config } );
	}

	static async CreateCluster( Config : Cluster ) : Promise<TResponse_Cluster_CreateCluster> {
		return await API_QueryLib.PostToAPI<TResponse_Cluster_CreateCluster, TRequest_Cluster_CreateCluster<false>>(
			EClusterApiUrl.createcluster, { Config } );
	}

	static async SendCommandToCluster( Id : string, Command : EArkmanagerCommands, Parameter : string[] ) : Promise<TResponse_Cluster_SendCommandToCluster> {
		return await API_QueryLib.PostToAPI<TResponse_Cluster_SendCommandToCluster, TRequest_Cluster_SendCommandToCluster<false>>(
			EClusterApiUrl.sendcommandtocluster, {
				Id, Command, Parameter
			} );
	}

	static async RemoveCluster( Id : string ) : Promise<TResponse_Cluster_RemoveCluster> {
		return await API_QueryLib.PostToAPI<TResponse_Cluster_RemoveCluster, TRequest_Cluster_RemoveCluster<false>>(
			EClusterApiUrl.removecluster, { Id } );
	}

	static async GetCluster() : Promise<Record<string, Cluster>> {
		const Result = await API_QueryLib.GetFromAPI<TResponse_Cluster_GetClusters, TRequest_Cluster_GetClusters<false>>(
			EClusterApiUrl.getclusters, {} );
		if ( Result.Data ) {
			return Result.Data;
		}
		return {};
	}
}
