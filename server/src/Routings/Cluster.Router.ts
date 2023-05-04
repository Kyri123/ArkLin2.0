import type * as core             from "express-serve-static-core";
import type {
	Request,
	Response
}                                 from "express-serve-static-core";
import { CreateUrlV2 }            from "@server/Lib/PathBuilder.Lib";
import type {
	TResponse_Cluster_CreateCluster,
	TResponse_Cluster_GetClusters,
	TResponse_Cluster_RemoveCluster,
	TResponse_Cluster_SendCommandToCluster,
	TResponse_Cluster_SetCluster
}                                 from "@app/Types/API_Response";
import { EPerm }                  from "../../../src/Shared/Enum/User.Enum";
import { EClusterApiUrl }         from "../../../src/Shared/Enum/Routing";
import type {
	TRequest_Cluster_CreateCluster,
	TRequest_Cluster_RemoveCluster,
	TRequest_Cluster_SendCommandToCluster,
	TRequest_Cluster_SetCluster
}                                 from "@app/Types/API_Request";
import {
	DefaultResponseFailed,
	DefaultResponseSuccess
}                                 from "../../../src/Shared/Default/ApiRequest.Default";
import { AuthMiddleware }         from "../Middleware/Auth.Middleware";
import type { Instance } from "../MongoDB/DB_Instances";
import DB_Instances from "../MongoDB/DB_Instances";
import { ServerLib }              from "@server/Lib/Server.Lib";
import type { Cluster }           from "../MongoDB/DB_Cluster";
import DB_Cluster                 from "../MongoDB/DB_Cluster";
import { EmitClusters }           from "@server/Lib/SocketIO.Lib";

const ValidateCluster = ( ClusterData : Partial<Cluster> ) : boolean => {
	if ( ClusterData.Master && ClusterData.DisplayName && ClusterData.Instances ) {
		return ClusterData.Master.length >= 4 && ClusterData.Instances.length >= 1 && ClusterData.Master !== "";
	}
	return false;
};

export default function( Api : core.Express ) {
	let [ Url, Perm ] = CreateUrlV2( EClusterApiUrl.getclusters, "GET", undefined );
	Api.get( Url, ( req, res, next ) => AuthMiddleware( Perm, {
		req,
		res,
		next
	}, {} ), async( request : Request, response : Response ) => {
		const Response : TResponse_Cluster_GetClusters = {
			...DefaultResponseSuccess,
			Data: {}
		};

		//const Request : TRequest_Cluster_GetClusters<true> = request.body;

		for await ( const Cluster of DB_Cluster.find( {} ) ) {
			Response.Data[ Cluster._id ] = Cluster.toJSON();
		}

		response.json( Response );
	} );

	[ Url, Perm ] = CreateUrlV2( EClusterApiUrl.createcluster, "POST", EPerm.ManageCluster );
	Api.post( Url, ( req, res, next ) => AuthMiddleware( Perm, {
		req,
		res,
		next
	} ), async( request : Request, response : Response ) => {
		const Response : TResponse_Cluster_CreateCluster = {
			...DefaultResponseFailed
		};

		const Request : TRequest_Cluster_CreateCluster<true> = request.body;
		if ( Request.Config && Request.Config.Master !== "" ) {
			const MasterServer = await ServerLib.build( Request.Config.Master );
			if ( MasterServer.IsValid() ) {
				if ( MasterServer.IsInCluster() ) {
					Response.Message.Title = "Fehler!";
					Response.Message.Message = "Der Master-Server ist bereits in einem Cluster";
					response.json( Response );
					return;
				}
				else if ( ValidateCluster( Request.Config ) ) {
					try {
						delete Request.Config._id;
						const NewCluster = await DB_Cluster.create( Request.Config );
						if ( NewCluster ) {
							await EmitClusters( NewCluster.toJSON() );
							Response.Success = true;
							Response.Message = {
								Message: "Cluster wurde erstellt und kann nun Konfiguriert werden",
								Title: "Erstellt!",
								AlertType: "success"
							};
						}
					}
					catch ( e ) {
						console.error( e );
					}
				}
			}
		}

		response.json( Response );
	} );


	[ Url, Perm ] = CreateUrlV2( EClusterApiUrl.setcluster, "POST", EPerm.ManageCluster );
	Api.post( Url, ( req, res, next ) => AuthMiddleware( Perm, {
		req,
		res,
		next
	} ), async( request : Request, response : Response ) => {
		const Response : TResponse_Cluster_SetCluster = {
			...DefaultResponseFailed
		};

		const Request : TRequest_Cluster_SetCluster<true> = request.body;
		if ( Request.Config && Request.Config.Master !== "" && Request.Id ) {
			const MasterServer = await ServerLib.build( Request.Config.Master );
			if ( MasterServer.IsValid() ) {
				const MasterCluster = MasterServer.GetCluster;
				if ( MasterCluster?._id === Request.Id ) {
					Response.Message.Title = "Fehler!";
					Response.Message.Message = "Der Master-Server ist bereits in einem anderen Cluster";
					response.json( Response );
					return;
				}
				else if ( ValidateCluster( Request.Config ) ) {
					try {
						delete Request.Config._id;
						const UpdatedCluster = await DB_Cluster.findByIdAndUpdate( Request.Id, Request.Config, { new: true } );
						if ( UpdatedCluster ) {
							await EmitClusters( UpdatedCluster.toJSON() );
							Response.Success = true;
							Response.Message = {
								Message: "Cluster wurde Geupdated!",
								Title: "Bearbeitet!",
								AlertType: "success"
							};
						}
					}
					catch ( e ) {
						console.error( e );
					}
				}
			}
		}

		response.json( Response );
	} );


	[ Url, Perm ] = CreateUrlV2( EClusterApiUrl.removecluster, "POST", EPerm.ManageCluster );
	Api.post( Url, ( req, res, next ) => AuthMiddleware( Perm, {
		req,
		res,
		next
	} ), async( request : Request, response : Response ) => {
		const Response : TResponse_Cluster_RemoveCluster = {
			...DefaultResponseFailed
		};

		const Request : TRequest_Cluster_RemoveCluster<true> = request.body;
		if ( Request.Id ) {
			try {
				await DB_Cluster.findByIdAndRemove( Request.Id );
				SocketIO.emit( "OnClusterRemoved" );
				Response.Success = true;
				Response.Message = {
					Message: "Cluster wurde Entfernt!",
					Title: "Entfernt!",
					AlertType: "success"
				};
			}
			catch ( e ) {
				console.error( e );
			}
		}

		response.json( Response );
	} );


	[ Url, Perm ] = CreateUrlV2( EClusterApiUrl.sendcommandtocluster, "POST", EPerm.ManageCluster );
	Api.post( Url, ( req, res, next ) => AuthMiddleware( Perm, {
		req,
		res,
		next
	} ), async( request : Request, response : Response ) => {
		const Response : TResponse_Cluster_SendCommandToCluster = {
			...DefaultResponseFailed
		};

		const Request : TRequest_Cluster_SendCommandToCluster<true> = request.body;
		if ( Request.Id && Request.Command && Request.Parameter ) {
			try {
				const Cluster = ( await DB_Cluster.findById( Request.Id ) )!;
				const Servers = await DB_Instances.find<Instance>( { _id: Cluster.Instances } );

				await Promise.all( Servers.map( async( ServerInstance ) => {
					const Server = await ServerLib.build( ServerInstance.Instance );
					if ( Server.IsValid() ) {
						return await Server.ExecuteCommand( Request.Command!, Request.Parameter! );
					}
					return false;
				} ) );

				Response.Success = true;
				Response.Message = {
					Message: "Befehl wurde an alle Server gesendet!",
					Title: "Gesendet!",
					AlertType: "success"
				};
			}
			catch ( e ) {
				console.error( e );
			}
		}

		response.json( Response );
	} );
}
