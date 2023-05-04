/** @format */

import {
	Outlet,
	useLocation
}                                     from "react-router-dom";
import type { FunctionComponent }     from "react";
import React, {
	Suspense,
	useContext,
	useEffect,
	useState
}                                     from "react";
import AccountContext                 from "@context/AccountContext";
import { DefaultSystemUsage }         from "@shared/Default/Server.Default";
import type { IAcceptActionFunction } from "@page/MainApp/PageComponents/General/CAcceptAction";
import CAcceptAction                  from "@page/MainApp/PageComponents/General/CAcceptAction";
import { API_System }                 from "@app/Lib/Api/API_System";
import { API_ServerLib }              from "@app/Lib/Api/API_Server.Lib";
import ServerContext                  from "@context/ServerContext";
import CLeftNavigation                from "@page/MainApp/PageComponents/Page/CLeftNavigation";
import CTopNavigation                 from "@page/MainApp/PageComponents/Page/CTopNavigation";
import CSideHeader                    from "@page/MainApp/PageComponents/Page/CSideHeader";
import CTraffics                      from "@page/MainApp/PageComponents/Page/CTraffics";
import CFoother                       from "@page/MainApp/PageComponents/Page/CFoother";
import type { Socket }                from "socket.io-client";
import io                             from "socket.io-client";
import { SocketIOLib }                from "@app/Lib/Api/SocketIO.Lib";
import type { SystemUsage }           from "@server/MongoDB/DB_Usage";
import type {
	EmitEvents,
	ListenEvents
}                                     from "@app/Types/Socket";
import CPanelLog                      from "@page/MainApp/PageComponents/Page/CPanelLog";
import type { Instance }              from "@server/MongoDB/DB_Instances";
import type { Cluster }               from "@server/MongoDB/DB_Cluster";

const SocketIO : Socket<EmitEvents, ListenEvents> = io(
	SocketIOLib.GetSpocketHost()
);

const Component : FunctionComponent = () => {
	const Account = useContext( AccountContext );
	const Location = useLocation();
	const [ ShowLog, setShowLog ] = useState( false );
	const [
		[ GameServerOnline, GameServerOffline, GameServerTotal ],
		setGameServerState
	] = useState<number[]>( [ 0, 0, 0 ] );
	const [ SystemUsage, setSystemUsage ] = useState<SystemUsage>( () => DefaultSystemUsage() );
	const [ HasData, setHasData ] = useState( false );
	const [ AcceptAction, setAcceptAction ] = useState<IAcceptActionFunction<any>>( {
		Payload: undefined,
		PayloadArgs: [],
		ActionTitle: ""
	} );

	const [ Instances, setInstances ] = useState<Record<string, Instance>>( {} );
	const [ Clusters, setClusters ] = useState<Record<string, Cluster>>( {} );

	useEffect( () => {
		API_System.GetSystemUsage().then( setSystemUsage );

		SocketIO.on( "OnSystemUpdate", ( Usage ) => {
			setSystemUsage( Usage );
			API_ServerLib.GetGlobalState().then( setGameServerState );
		} );

		const GetAllServer = async() => {
			/*const [ GameServerS, Instance, Clusters ] = await Promise.all( [
			 API_ServerLib.GetGlobalState(),
			 API_ServerLib.GetAllServer(),
			 API_ClusterLib.GetCluster()
			 ] );

			 setClusters( () => Clusters );
			 setGameServerState( () => GameServerS );
			 setInstances( () => ( {
			 ...Instance.Data
			 } ) );

			 setHasData( () => true );*/
		};

		GetAllServer().then( () => {
		} );

		SocketIO.on( "OnServerUpdated", ( R ) =>
			setInstances( ( I ) => ( {
				...I,
				...R
			} ) )
		);

		SocketIO.on( "OnClusterUpdated", ( R ) =>
			setClusters( ( I ) => ( {
				...I,
				...R
			} ) )
		);

		SocketIO.on( "OnClusterRemoved", GetAllServer );
		SocketIO.on( "OnServerRemoved", GetAllServer );
		SocketIO.on( "connect", GetAllServer );
		SocketIO.on( "disconnect", () => setHasData( false ) );

		return () => {
			SocketIO.off( "OnClusterRemoved", GetAllServer );
			SocketIO.off( "OnClusterUpdated" );
			SocketIO.off( "connect" );
			SocketIO.off( "disconnect" );
			SocketIO.off( "OnServerUpdated" );
			SocketIO.off( "OnServerRemoved", GetAllServer );
			SocketIO.off( "OnSystemUpdate" );
		};
	}, [] );

	if ( !Account.Account.IsLoggedIn() ) {
		window.location.href = "/signin";
		return <></>;
	}

	return (
		<>
			<ServerContext.Provider
				value={ { InstanceData: Instances, HasData: HasData, ClusterData: Clusters } }
			>
				<Suspense fallback={ <></> }>
					<main className="d-flex flex-nowrap w-100">
						<CLeftNavigation/>
						<div className="flex-fill d-flex flex-column w-100">
							<div className="flex-grow-0">
								<CTopNavigation
									ShowLog={ setShowLog }
									ServerState={ [ GameServerOnline, GameServerOffline ] }
									SystemUsage={ SystemUsage }
								/>
							</div>

							<div className="flex-grow-0">
								<CSideHeader/>
							</div>

							<div className="flex-auto h-100 overflow-y-scroll overflow-x-hidden">
								<section
									className="content p-3 h-100 pt-0 pb-0">
									<div className="py-3">
										<CTraffics
											SystemUsage={ SystemUsage }
											ServerState={ [
												GameServerOnline,
												GameServerOffline,
												GameServerTotal
											] }
										/>

										<Outlet/>
									</div>
								</section>
							</div>

							<div className="flex-grow-0">
								<CFoother SystemUsage={ SystemUsage }/>
							</div>
						</div>
					</main>

					<CPanelLog Show={ ShowLog } OnHide={ () => setShowLog( false ) }/>
					<CAcceptAction
						Function={ AcceptAction }
						SetFunction={ setAcceptAction }
					/>
				</Suspense>
			</ServerContext.Provider>
		</>
	);
};

export { Component };
