/** @format */

import { FontAwesomeIcon }            from "@fortawesome/react-fontawesome";
import React, {
	Suspense,
	useContext,
	useEffect,
	useState
}                                     from "react";
import { Modal }                      from "react-bootstrap";
import {
	Route,
	Routes
}                                     from "react-router";
import {
	Navigate,
	useLocation
}                                     from "react-router-dom";
import type { Socket }                from "socket.io-client";
import io                             from "socket.io-client";
import type { IAcceptActionFunction } from "./Pages/MainApp/PageComponents/General/CAcceptAction";
import CAcceptAction                  from "./Pages/MainApp/PageComponents/General/CAcceptAction";
import { CAlert }                     from "./Pages/MainApp/PageComponents/General/CAlert";
import CLeftNavigation                from "./Pages/MainApp/PageComponents/Page/CLeftNavigation";
import CTopNavigation                 from "./Pages/MainApp/PageComponents/Page/CTopNavigation";
import AccountContext                 from "./Context/AccountContext";
import AlertContext                   from "./Context/AlertContext";
import ServerContext                  from "./Context/ServerContext";
import { API_ServerLib }              from "./Lib/Api/API_Server.Lib";
import { API_System }                 from "./Lib/Api/API_System";
import { SocketIOLib }                from "./Lib/Api/SocketIO.Lib";
import type {
	Cluster,
	Instance
}                                     from "./Types/MongoDB";
import { DefaultSystemUsage }         from "./Shared/Default/Server.Default";
import type {
	IEmitEvents,
	IListenEvents
}                                     from "./Shared/Type/Socket";
import type { SystemUsage }           from "./Shared/Type/Systeminformation";
import type { IAPIResponseBase }      from "./Shared/Type/API_Response";
import CSideHeader                    from "./Pages/MainApp/PageComponents/Page/CSideHeader";
import CTraffics                      from "./Pages/MainApp/PageComponents/Page/CTraffics";
import CFoother                       from "./Pages/MainApp/PageComponents/Page/CFoother";
import { API_ClusterLib }             from "./Lib/Api/API_Cluster.Lib";

const P403 = React.lazy( () => import("@page/error/[statusCode]") );
const P404 = React.lazy( () => import("./Pages/error/P404") );

const PCluster = React.lazy(
	() => import("./Pages/MainApp/PCluster")
);
const PUsersettings = React.lazy(
	() => import("./Pages/MainApp/PUsersettings")
);
const PServer = React.lazy(
	() => import("./Pages/MainApp/PServer")
);
const PPanelsettings = React.lazy(
	() => import("./Pages/MainApp/PPanelsettings")
);
const PAdminServer = React.lazy(
	() => import("./Pages/MainApp/PAdminServer")
);
const PUsers = React.lazy(
	() => import("./Pages/MainApp/PUsers")
);
const CPanelLog = React.lazy(
	() => import("./Pages/MainApp/PageComponents/Page/CPanelLog")
);
const PHome = React.lazy(
	() => import("./Pages/MainApp/PHome")
);
const PChangelog = React.lazy(
	() => import("./Pages/MainApp/PChangelog")
);

const SocketIO : Socket<IEmitEvents, IListenEvents> = io(
	SocketIOLib.GetSpocketHost()
);

export default function MainApp() {
	const Account = useContext( AccountContext );
	const Location = useLocation();
	const [ Alert, setAlert ] = useState<IAPIResponseBase<true> | undefined>( undefined );
	const [ ShowLog, setShowLog ] = useState( false );
	const [
		[ GameServerOnline, GameServerOffline, GameServerTotal ],
		setGameServerState
	] = useState<number[]>( [ 0, 0, 0 ] );
	const [ SystemUsage, setSystemUsage ] = useState<SystemUsage>(
		DefaultSystemUsage()
	);
	const [ HasData, setHasData ] = useState( false );
	const [ AcceptAction, setAcceptAction ] = useState<IAcceptActionFunction<any>>( {
		Payload: undefined,
		PayloadArgs: [],
		ActionTitle: ""
	} );

	const [ Instances, setInstances ] = useState<Record<string, Instance>>( {} );
	const [ Clusters, setClusters ] = useState<Record<string, Cluster>>( {} );

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect( () => {
		setAlert( undefined );
	}, [ Location ] );

	useEffect( () => {
		API_System.GetSystemUsage().then( setSystemUsage );

		SocketIO.on( "OnSystemUpdate", ( Usage ) => {
			setSystemUsage( Usage );
			API_ServerLib.GetGlobalState().then( setGameServerState );
		} );

		const GetAllServer = async() => {
			const [ GameServerS, Instance, Clusters ] = await Promise.all( [
				API_ServerLib.GetGlobalState(),
				API_ServerLib.GetAllServer(),
				API_ClusterLib.GetCluster()
			] );

			setClusters( () => Clusters );
			setGameServerState( () => GameServerS );
			setInstances( () => ( {
				...Instance.Data
			} ) );

			setHasData( () => true );
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

	if ( !HasData ) {
		return (
			<Modal show={ true } size={ "xl" } onHide={ () => {
			} } centered>
				<Modal.Body style={ { paddingTop: 150, paddingBottom: 150 } }>
					<center>
						<p style={ { fontSize: 100 } }>
							<FontAwesomeIcon icon={ "spinner" } spin={ true }/>
						</p>
						<p style={ { fontSize: 35 } }> Versuche verbindung zur API aufzubauen...</p>
					</center>
				</Modal.Body>
			</Modal>
		);
	}

	return (
		<>
			<AlertContext.Provider
				value={ {
					DoSetAlert: setAlert,
					setAcceptAction: setAcceptAction
				} }
			>
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

											<CAlert
												Data={ Alert }
												OnClear={ () => setAlert( undefined ) }
											/>

											<Suspense fallback={ <></> }>
												<Routes>
													<Route path="/home" element={ <PHome/> }/>
													<Route
														path="/cluster"
														element={ <PCluster/> }
													/>
													<Route
														path="/version/:version/*"
														element={ <PChangelog/> }
													/>
													<Route
														path="/adminserver"
														element={ <PAdminServer/> }
													/>
													<Route path="/users" element={ <PUsers/> }/>
													<Route path="/me/*" element={ <PUsersettings/> }/>
													<Route
														path="/paneladmin"
														element={ <PPanelsettings/> }
													/>
													<Route
														path="/server/:InstanceName/*"
														element={ <PServer/> }
													/>
													<Route path="/home/404" element={ <P404/> }/>
													<Route path="/home/403" element={ <P403/> }/>
													<Route
														path={ "*" }
														element={ <Navigate to={ "/home/404" }/> }
													/>
												</Routes>
											</Suspense>
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
			</AlertContext.Provider>
		</>
	);
}
