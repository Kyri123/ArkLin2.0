import { API_QueryLib }        from "./API_Query.Lib";
import type {
	TResponse_Cluster_CreateCluster,
	TResponse_Cluster_GetClusters,
	TResponse_Cluster_RemoveCluster,
	TResponse_Cluster_SendCommandToCluster,
	TResponse_Cluster_SetCluster
}                              from "../../Shared/Type/API_Response";
import type { IMO_Cluster }         from "../../Types/MongoDB";
import { EClusterApiUrl }      from "../../Shared/Enum/Routing";
import type {
	TRequest_Cluster_CreateCluster,
	TRequest_Cluster_GetClusters,
	TRequest_Cluster_RemoveCluster,
	TRequest_Cluster_SendCommandToCluster,
	TRequest_Cluster_SetCluster
}                              from "../../Shared/Type/API_Request";
import type { EArkmanagerCommands } from "../ServerUtils.Lib";

export class API_ClusterLib {
	static async SetCluster(
		Id : string,
		Config : IMO_Cluster
	) : Promise<TResponse_Cluster_SetCluster> {
		return await API_QueryLib.PostToAPI<TResponse_Cluster_SetCluster, TRequest_Cluster_SetCluster<false>>(
			EClusterApiUrl.setcluster, { Id, Config } );
	}

	static async CreateCluster( Config : IMO_Cluster ) : Promise<TResponse_Cluster_CreateCluster> {
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

	static async GetCluster() : Promise<Record<string, IMO_Cluster>> {
		const Result = await API_QueryLib.GetFromAPI<TResponse_Cluster_GetClusters, TRequest_Cluster_GetClusters<false>>(
			EClusterApiUrl.getclusters, {} );
		if ( Result.Data ) {
			return Result.Data;
		}
		return {};
	}
}
