/** @format */

import { FontAwesomeIcon }                      from "@fortawesome/react-fontawesome";
import React, {
	Suspense,
	useContext,
	useEffect,
	useState
}                                               from "react";
import { Modal }                                from "react-bootstrap";
import {
	Route,
	Routes
}                                               from "react-router";
import {
	Navigate,
	useLocation
}                                               from "react-router-dom";
import io, { Socket }                           from "socket.io-client";
import CAcceptAction, { IAcceptActionFunction } from "./Components/Elements/CAcceptAction";
import { CAlert }                               from "./Components/Elements/CAlert";
import CLeftNavigation                          from "./Components/Elements/MainPage/CLeftNavigation";
import CTopNavigation                           from "./Components/Elements/MainPage/CTopNavigation";
import AccountContext                           from "./Context/AccountContext";
import AlertContext                             from "./Context/AlertContext";
import ServerContext                            from "./Context/ServerContext";
import { API_ServerLib }                        from "./Lib/Api/API_Server.Lib";
import { API_System }                           from "./Lib/Api/API_System";
import { SocketIOLib }                          from "./Lib/Api/SocketIO.Lib";
import StringMapLib                             from "./Lib/StringMap.Lib";
import { IMO_Instance }                         from "./Shared/Api/MongoDB";
import { DefaultSystemUsage }                   from "./Shared/Default/Server.Default";
import {
	IEmitEvents,
	IListenEvents
}                                               from "./Shared/Type/Socket";
import { ISystemUsage }                         from "./Shared/Type/Systeminformation";
import { IAPIResponseBase }                     from "./Types/API";

const P403 = React.lazy( () => import("./Pages/ErrorPages/P403") );
const P404 = React.lazy( () => import("./Pages/ErrorPages/P404") );

const PUsersettings = React.lazy( () => import("./Pages/MainApp/PUsersettings") );
const PServer = React.lazy( () => import("./Pages/MainApp/PServer") );
const PPanelsettings = React.lazy(
	() => import("./Pages/MainApp/PPanelsettings")
);
const PAdminServer = React.lazy( () => import("./Pages/MainApp/PAdminServer") );
const CTraffics = React.lazy(
	() => import("./Components/Elements/MainPage/CTraffics")
);
const CFoother = React.lazy(
	() => import("./Components/Elements/MainPage/CFoother")
);
const PUsers = React.lazy( () => import("./Pages/MainApp/PUsers") );
const CPanelLog = React.lazy(
	() => import("./Components/Elements/MainPage/CPanelLog")
);
const PHome = React.lazy( () => import("./Pages/MainApp/PHome") );
const PChangelog = React.lazy( () => import("./Pages/MainApp/PChangelog") );

const SocketIO : Socket<IEmitEvents, IListenEvents> = io(
	SocketIOLib.GetSpocketHost()
);

export default function MainApp() {
	const Account = useContext( AccountContext );
	const Location = useLocation();
	const [ Alert, setAlert ] = useState<IAPIResponseBase | undefined>( undefined );
	const [ ShowLog, setShowLog ] = useState( false );
	const [
		[ GameServerOnline, GameServerOffline, GameServerTotal ],
		setGameServerState
	] = useState<number[]>( [ 0, 0, 0 ] );
	const [ SystemUsage, setSystemUsage ] = useState<ISystemUsage>(
		DefaultSystemUsage()
	);
	const [ HasData, setHasData ] = useState( false );
	const [ AcceptAction, setAcceptAction ] = useState<IAcceptActionFunction<any>>( {
		Payload: undefined,
		PayloadArgs: [],
		ActionTitle: ""
	} );

	const [ Instances, setInstances ] = useState<Record<string, IMO_Instance>>( {} );

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
			const [ GameServerS, Instance ] = await Promise.all( [
				API_ServerLib.GetGlobalState(),
				API_ServerLib.GetAllServer()
			] );

			setGameServerState( GameServerS );
			setInstances( {
				...Instance.Data?.InstanceData
			} );

			setHasData( true );
		};

		GetAllServer().then( () => {
		} );

		SocketIO.on( "OnServerStateFinished", GetAllServer );
		SocketIO.on( "OnServerUpdated", ( R ) =>
			setInstances( ( I ) => ( {
				...I,
				...R
			} ) )
		);

		return () => {
			SocketIO.off( "OnServerUpdated" );
			SocketIO.off( "OnServerStateFinished", GetAllServer );
			SocketIO.off( "OnSystemUpdate" );
		};
	}, [] );

	if ( !Account.Account.IsLoggedIn() ) {
		window.location.href = "/signin";
		return <></>;
	}

	const Pathname = window.location.pathname.split( "/" );
	Pathname.shift();

	if ( !HasData ) {
		return (
			<Modal show={ true } size={ "xl" } centered>
				<Modal.Body style={ { paddingTop: 150, paddingBottom: 150 } }>
					<center>
						<p style={ { fontSize: 100 } }>
							<FontAwesomeIcon icon={ "spinner" } spin={ true } />
						</p>
						<p style={ { fontSize: 35 } }> Lese Server Daten...</p>
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
					value={ { InstanceData: Instances, HasData: HasData } }
				>
					<Suspense fallback={ <></> }>
						<main className="d-flex flex-nowrap">
							<CLeftNavigation />
							<div className={ "flex-fill" }>
								<CTopNavigation
									ShowLog={ setShowLog }
									ServerState={ [ GameServerOnline, GameServerOffline ] }
									SystemUsage={ SystemUsage }
								/>

								<div className="content-header">
									<div className="container-fluid">
										<div className="row mb-2">
											<div className="col-sm-6">
												<h3>
													{ StringMapLib.Nav( Pathname[ Pathname.length - 1 ] ) }
												</h3>
											</div>
											<div className="col-sm-6">
												<ol className="breadcrumb float-sm-end">
													{ Pathname.map( ( V ) => (
														<li className="breadcrumb-item" key={ V }>
															{ StringMapLib.Nav( V ) }
														</li>
													) ) }
												</ol>
											</div>
										</div>
									</div>
								</div>

								<section className="content">
									<div className="container-fluid">
										<div className="container-fluid">
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
													<Route path="/home" element={ <PHome /> } />
													<Route
														path="/changelog/:version"
														element={ <PChangelog /> }
													/>
													<Route
														path="/adminserver"
														element={ <PAdminServer /> }
													/>
													<Route path="/users" element={ <PUsers /> } />
													<Route path="/me/*" element={ <PUsersettings /> } />
													<Route
														path="/paneladmin"
														element={ <PPanelsettings /> }
													/>
													<Route
														path="/server/:InstanceName/*"
														element={ <PServer /> }
													/>
													<Route path="/home/404" element={ <P404 /> } />
													<Route path="/home/403" element={ <P403 /> } />
													<Route
														path={ "*" }
														element={ <Navigate to={ "/home/404" } /> }
													/>
												</Routes>
											</Suspense>
										</div>
									</div>
								</section>

								<CFoother SystemUsage={ SystemUsage } />
								<CPanelLog Show={ ShowLog } OnHide={ () => setShowLog( false ) } />
								<CAcceptAction
									Function={ AcceptAction }
									SetFunction={ setAcceptAction }
								/>
							</div>
						</main>
					</Suspense>
				</ServerContext.Provider>
			</AlertContext.Provider>
		</>
	);
}
